const Order = require('../models/orders');
const Product = require('../models/products');
const OrderStatus = require('../models/orderStatus'); 
const payos = require('../utils/payos');
const crypto = require('crypto');


// Tạo link thanh toán
const createPaymentLink = async (order) => {
  const domain = process.env.CLIENT_DOMAIN;

  const items = order.items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  const requestData = {
    orderCode: order.order_code,
    amount: Math.round(order.total_amount),
    description: `DH#${order._id}`.substring(0, 25),
    items,
    cancelUrl: `${domain}/payment/cancel`,
    returnUrl: `${domain}/payment/success`,
    buyerName: 'Khách hàng',
    buyerAddress: order.shipping_address,
    expiredAt: Math.floor(Date.now() / 1000) + 3600,
  };

  try {
    const result = await payos.createPaymentLink(requestData);
    return result.checkoutUrl;
  } catch (err) {
    console.error('Tạo link PayOS lỗi:', err);
    return null;
  }
};

// Xác thực chữ ký webhook PayOS
const verifyPayOSWebhook = (body) => {
  const CLIENT_SECRET = process.env.PAYOS_CHECKSUM_KEY;
  if (!CLIENT_SECRET) throw new Error('Missing PAYOS_CHECKSUM_KEY in .env');

  const { amount, orderCode, transactionId, signature } = body;

  // Nếu thiếu bất kỳ giá trị nào, return false luôn
  if (!amount || !orderCode || !transactionId || !signature) return false;

  const raw = `amount=${amount}&orderCode=${orderCode}&transactionId=${transactionId}`;
  const hash = crypto.createHmac('sha256', CLIENT_SECRET).update(raw).digest('hex');

  return hash === signature;
};


// Xử lý webhook từ PayOS
const handleWebhook = async (req, res) => {
  try {
    // const data = payos.verifyPaymentWebhookData(req.body);
    const data = req.body; 
    
    if (!verifyPayOSWebhook(data)) {
      return res.status(400).send('Invalid signature');
    }
    const order = await Order.findOne({ order_code: data.orderCode });

    if (!order) return res.status(404).send('Order not found');
    
    if (order.payment_status === 'canceled' || order.expires_at < Date.now()) {
      return res.status(400).json({ message: 'Đơn hàng đã bị hủy hoặc hết hạn. Không thể thanh toán.' });
    }

    if (order.payment_status !== 'paid') {
      order.payment_status = 'paid';
      order.paid_at = new Date();
      order.payment_method = 'payos';
      await order.save();
    }


    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook lỗi:', err);
    res.status(400).send('Invalid webhook');
  }
};
const cancelOrderByPayOS = async (req, res) => {
  try {
    console.log('✅ Đã vào router GET /payment/cancel');

    const order_code = req.query.order_code || req.query.orderCode;
    console.log('🔁 /payment/cancel HIT with query:', req.query);

    if (!order_code) {
      return res.status(400).json({ message: 'Thiếu mã đơn hàng (order_code)' });
    }

    const order = await Order.findOne({ order_code });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.payment_method !== 'payos') {
      return res.status(400).json({ message: 'Đơn hàng không thuộc thanh toán PayOS' });
    }

    if (order.payment_status !== 'unpaid') {
      return res.status(400).json({ message: 'Đơn hàng đã được xử lý, không thể huỷ' });
    }

    const status = await OrderStatus.findById(order.status_id);
    if (!status || status.code !== 'pending') {
      return res.status(400).json({ message: 'Đơn hàng không ở trạng thái chờ xử lý' });
    }

    // Trả lại tồn kho
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Giảm lượt sử dụng mã giảm giá nếu có
    if (order.discount_id) {
      const discount = await Discount.findById(order.discount_id);
      if (discount && discount.used_count > 0) {
        discount.used_count -= 1;
        await discount.save();
      }
    }

    // Cập nhật trạng thái thanh toán
    order.payment_status = 'canceled';
    await order.save();

    // Có thể redirect hoặc trả JSON
    return res.redirect('/order-canceled'); // Hoặc: res.status(200).json({ message: 'Huỷ đơn hàng thành công.' });

  } catch (err) {
    console.error('Error in cancelOrderByPayOS:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};


module.exports = {
  createPaymentLink,
  handleWebhook,
  cancelOrderByPayOS
};
