const Order = require('../models/orders'); // Đường dẫn đến model Order
const Discount = require('../models/discount'); // Đường dẫn đến model Discount
const Product = require('../models/products'); 
const OrderStatus = require('../models/orderStatus'); 
const OrderStatusDescription = require('../models/orderStatusDescription'); 
const { createPaymentLink } = require('./payment'); 
const mongoose = require('mongoose');


// API tạo đơn hàng + thanh toán
exports.createOrder = async (req, res) => {
  const { user_id, discount_code, items, payment_method, shipping_address } = req.body;

  try {
    if (!user_id || !items || !Array.isArray(items) || items.length === 0 || !payment_method || !shipping_address) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let total_amount = 0;

  for (let item of items) {
    const product = products.find(p => p._id.toString() === item.productId);

    if (!product) {
      return res.status(400).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại.` });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ tồn kho.` });
    }

    // 🔥 Dòng này rất quan trọng — THÊM NGAY!
    item.name = product.name;
    // console.log("product.name", product.name);
    

    item.price = product.price;
    total_amount += product.price * item.quantity;

    product.stock -= item.quantity;
    await product.save();
  }


    let discount = null;
    if (discount_code) {
      discount = await Discount.findOne({ code: discount_code });
      if (!discount) return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });

      const now = new Date();
      if (now < discount.start_date || now > discount.end_date) return res.status(400).json({ message: 'Mã giảm giá đã hết hạn.' });
      if (discount.used_count >= discount.usage_limit) return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });

      total_amount -= (total_amount * discount.percentage) / 100;
    }

    const status = await OrderStatus.findOne({ code: 'pending' });
    if (!status) return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });

    const orderCode = Date.now(); // mã đơn dùng làm orderCode cho PayOS
    const newOrder = new Order({
      user_id,
      order_code: orderCode, // thêm dòng này
      total_amount,
      discount_id: discount ? discount._id : null,
      payment_status: 'unpaid',
      payment_method,
      status_id: status._id,
      status_sub_id: null,
      shipping_address,
      items,
    });
    console.log("Order items before payment:", newOrder.items);


    await newOrder.save();

    if (discount) {
      discount.used_count += 1;
      await discount.save();
    }

    if (payment_method === 'payos') {
      const paymentUrl = await createPaymentLink(newOrder);

      if (paymentUrl) {
        return res.status(200).json({
          message: 'Đơn hàng đã được tạo thành công. Vui lòng thanh toán.',
          payment_url: paymentUrl,
        });
      } else {
        return res.status(500).json({ message: 'Không thể tạo link thanh toán PayOS' });
      }
    }

    return res.status(200).json({
      message: 'Đơn hàng đã được tạo thành công.',
      order: newOrder,
    });

  } catch (err) {
    console.error("Error in createOrder:", err);
    res.status(500).send('Server Error');
  }
};

// API lấy thông tin đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id; // Yêu cầu đã đăng nhập và có req.user

    const orders = await Order.find({ user_id: userId })
      .populate('status_id', 'name code')          // Trạng thái chính
      .populate('status_sub_id', 'name code')      // Trạng thái con (nếu có)
      .sort({ createdAt: -1 });                    // Mới nhất trước
    const totalOrder = orders.length;

    res.status(200).json({ 
      totalOrder, 
      orders 
    });
  } catch (err) {
    console.error('❌ Lỗi lấy đơn hàng người dùng:', err);
    res.status(500).send('Server Error');
  }
};

// API admin xử lý đơn hàng (cập nhật trạng thái đơn hàng)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status_code, status_sub_code } = req.body;

    // ✅ Kiểm tra quyền admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền thay đổi trạng thái đơn hàng.' });
    }

    // ✅ Tìm đơn hàng
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
    }

    // ✅ Tìm trạng thái chính
    const status = await OrderStatus.findOne({ code: status_code });
    if (!status) {
      return res.status(404).json({ message: 'Mã trạng thái chính không hợp lệ.' });
    }

    // ✅ Nếu có trạng thái con thì kiểm tra
    let status_sub = null;
    if (status_sub_code) {
      status_sub = await OrderStatusDescription.findOne({ code: status_sub_code });
      if (!status_sub) {
        return res.status(404).json({ message: 'Mã trạng thái con không hợp lệ.' });
      }
    }

    // ✅ Cập nhật trạng thái
    order.status_id = status._id;
    order.status_sub_id = status_sub ? status_sub._id : null;
    await order.save();

    console.log(`✅ Đơn hàng ${order._id} đã cập nhật trạng thái: ${status_code}${status_sub_code ? ' - ' + status_sub_code : ''}`);

    return res.status(200).json({
      message: '✅ Trạng thái đơn hàng đã được cập nhật thành công.',
      data: {
        order_id: order._id,
        status_code,
        status_sub_code: status_sub_code || null
      }
    });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', err);
    return res.status(500).send('Server Error');
  }
};

//Admin có thể tra cứu đơn hàng của bất kỳ user nào
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Kiểm tra userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const orders = await Order.find({ user_id: objectId })
      .populate('status_id', 'name code')
      .populate('status_sub_id', 'name code')
      .sort({ createdAt: -1 });

    const totalOrder = orders.length;

    res.status(200).json({
      userId,
      totalOrder,
      orders
    });
  } catch (err) {
    console.error('❌ Lỗi lấy đơn hàng theo userId:', err);
    res.status(500).send('Server Error');
  }
};