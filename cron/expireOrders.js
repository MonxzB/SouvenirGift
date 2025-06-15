// cron/expireOrders.js
const cron = require('node-cron');
const Order = require('../models/orders'); // Đường dẫn đến model Order
const Product = require('../models/products'); 

// Job: Hủy các đơn chưa thanh toán và hết hạn
const cancelExpiredOrders = async () => {
  const now = new Date();

  const expiredOrders = await Order.find({
    payment_status: 'unpaid',
    expires_at: { $lt: now }
  });

  for (let order of expiredOrders) {
    console.log(`>> Đơn ${order.order_code} đã hết hạn, tiến hành huỷ`);

    // Trả lại kho hàng
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Hủy đơn hàng
    order.payment_status = 'canceled';
    await order.save();
  }
};

// Lên lịch cron mỗi 5 phút chạy 1 lần
const startCronJob = () => {
    cron.schedule('*/5 * * * * ', () => {
    console.log('⏰ Cron job kiểm tra đơn hàng hết hạn đang chạy...');
    cancelExpiredOrders();
    });
};

module.exports = startCronJob;
