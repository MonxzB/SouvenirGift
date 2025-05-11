const Order = require('../models/orders');
const payos = require('../utils/payos');

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

// Xử lý webhook từ PayOS
const handleWebhook = async (req, res) => {
  try {
    // const data = payos.verifyPaymentWebhookData(req.body);
    const data = req.body; // ⚠️ chỉ dùng để test Postman!


    const order = await Order.findOne({ order_code: data.orderCode });

    if (!order) return res.status(404).send('Order not found');

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

module.exports = {
  createPaymentLink,
  handleWebhook,
};
