const Order = require('../models/orders'); // Đường dẫn đến model Order
const Discount = require('../models/discount'); // Đường dẫn đến model Discount
const Product = require('../models/products'); 
const OrderStatus = require('../models/orderStatus'); 
const { createPaymentLink } = require('./payment'); 
const mongoose = require('mongoose');


// API tạo đơn hàng + thanh toán
exports.createOrder = async (req, res) => {
  try {
    const { discount_code, items, payment_method, shipping_address } = req.body;
    const user_id = req.user._id;
    // console.log("user_id: ", user_id);


    // Kiểm tra user đã có đơn hàng chưa thanh toán và chưa hết hạn
    const existingOrder = await Order.findOne({
      user_id,
      $or: [
        { payment_status: 'unpaid', expires_at: { $gt: new Date() } },
        { payment_method: 'cod', payment_status: 'unpaid' } // Đơn COD không có expires_at?
      ]
    });
    if (existingOrder) {
      return res.status(400).json({
        message: 'Bạn đã có một đơn hàng chưa thanh toán. Vui lòng thanh toán hoặc đợi đơn hết hạn.'
      });
    }

    
    const expires_at = new Date(Date.now() + (
    payment_method === 'payos' 
    ?  30 * 60 * 1000  : 3 * 24 * 60 * 60 * 1000));
    

    // Kiểm tra dữ liệu bắt buộc
    if (!items || !Array.isArray(items) || items.length === 0 || !payment_method || !shipping_address) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Lấy thông tin sản phẩm
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let total_amount = 0;
    let product_count = 0;

    for (let item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) {
        return res.status(400).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ tồn kho.` });
      }

      item.name = product.name;
      item.price = product.price;
      total_amount += product.price * item.quantity;

      product_count+=item.quantity;

      product.stock -= item.quantity;
      await product.save();
    }
    console.log(product_count);
    

    // Xử lý giảm giá nếu có
    let discount = null;
    if (discount_code) {
      discount = await Discount.findOne({ code: discount_code });
      if (!discount) return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });

      const now = new Date();
      if (now < discount.start_date || now > discount.end_date)
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn.' });

      if (discount.used_count >= discount.usage_limit)
        return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });

      total_amount -= (total_amount * discount.percentage) / 100;
    }

    // Lấy trạng thái "pending"
    const status = await OrderStatus.findOne({ code: 'pending' });
    if (!status) return res.status(400).json({ message: 'Không tìm thấy trạng thái đơn hàng mặc định.' });

    // Tạo đơn hàng
    const orderCode = Date.now(); // tạm thời làm mã đơn

    const newOrder = new Order({
      user_id,
      order_code: orderCode,
      total_amount,
      product_count,
      discount_id: discount ? discount._id : null,
      payment_status: 'unpaid',
      payment_method,
      status_id: status._id,
      expires_at,
      shipping_address,
      items,
    });

    await newOrder.save();

    // Cập nhật lượt dùng mã giảm giá
    if (discount) {
      discount.used_count += 1;
      await discount.save();
    }

    // Nếu thanh toán online: tạo link PayOS
    if (payment_method === 'payos') {
      const paymentUrl = await createPaymentLink(newOrder);
      if (!paymentUrl) return res.status(500).json({ message: 'Không thể tạo link thanh toán PayOS' });

      return res.status(200).json({
        message: 'Đơn hàng đã được tạo. Vui lòng thanh toán.',
        payment_url: paymentUrl,
      });
    }

    // Nếu COD: trả về đơn hàng luôn
    return res.status(200).json({
      message: 'Đơn hàng đã được tạo thành công.',
      order: newOrder,
      product_count
    });

  } catch (err) {
    console.error('Error in createOrder:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

// API huỷ hoặc xóa đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user_id: userId });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép huỷ nếu chưa thanh toán và ở trạng thái pending
    if (order.payment_status !== 'unpaid') {
      return res.status(400).json({ message: 'Không thể huỷ đơn hàng đã thanh toán' });
    }

    const status = await OrderStatus.findById(order.status_id);
    if (!status || status.code !== 'pending') {
      return res.status(400).json({ message: 'Đơn hàng không ở trạng thái có thể huỷ' });
    }

    // Trả lại tồn kho
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Nếu có mã giảm giá, giảm used_count
    if (order.discount_id) {
      const discount = await Discount.findById(order.discount_id);
      if (discount && discount.used_count > 0) {
        discount.used_count -= 1;
        await discount.save();
      }
    }

    // Xóa đơn hàng
    await Order.deleteOne({ _id: orderId });

    return res.status(200).json({ message: 'Đơn hàng đã được huỷ và xóa thành công.' });
  } catch (err) {
    console.error('Error in cancelOrder:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};
// API lấy thông tin đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id; // Yêu cầu đã đăng nhập và có req.user

    const orders = await Order.find({ user_id: userId })
      .populate('status_id', 'name code')          // Trạng thái chính
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