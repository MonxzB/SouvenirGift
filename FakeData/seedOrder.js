require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const OrderStatus = require('../models/orderStatus'); // Đường dẫn đến model OrderStatus
const OrderStatusDescription = require('../models/orderStatusDescription'); // Đường dẫn đến model OrderStatusDescription
const connectDB = require('../config/db');

// Kết nối MongoDB
connectDB();


const seedOrderStatusesAndDescriptions = async () => {
  try {
    // Xóa dữ liệu cũ
    await OrderStatus.deleteMany({});
    await OrderStatusDescription.deleteMany({});

    // Tạo các trạng thái chính (OrderStatus)
    const pendingStatus = new OrderStatus({
      code: 'pending',
      label: 'Chờ xử lý',
      description: 'Đơn hàng đã được đặt nhưng chưa thanh toán.',
    });
    await pendingStatus.save();

    const processingStatus = new OrderStatus({
      code: 'processing',
      label: 'Đang xử lý',
      description: 'Đơn hàng đang được xử lý.',
    });
    await processingStatus.save();

    const shippedStatus = new OrderStatus({
      code: 'shipped',
      label: 'Đã giao',
      description: 'Đơn hàng đã được gửi đi và đang trên đường.',
    });
    await shippedStatus.save();

    const deliveredStatus = new OrderStatus({
      code: 'delivered',
      label: 'Đã giao thành công',
      description: 'Đơn hàng đã được giao thành công đến khách hàng.',
    });
    await deliveredStatus.save();

    const cancelledStatus = new OrderStatus({
      code: 'cancelled',
      label: 'Đã hủy',
      description: 'Đơn hàng đã bị hủy bởi khách hàng hoặc vì lý do khác.',
    });
    await cancelledStatus.save();

    const refundedStatus = new OrderStatus({
      code: 'refunded',
      label: 'Đã hoàn tiền',
      description: 'Đơn hàng đã bị hủy và tiền đã được hoàn trả cho khách hàng.',
    });
    await refundedStatus.save();

    const failedStatus = new OrderStatus({
      code: 'failed',
      label: 'Lỗi',
      description: 'Đơn hàng không thể hoàn tất do lỗi hệ thống.',
    });
    await failedStatus.save();

    const waitingForConfirmationStatus = new OrderStatus({
      code: 'waiting_for_confirmation',
      label: 'Chờ xác nhận',
      description: 'Đơn hàng đang chờ xác nhận từ khách hàng.',
    });
    await waitingForConfirmationStatus.save();

    const outOfStockStatus = new OrderStatus({
      code: 'out_of_stock',
      label: 'Hết hàng',
      description: 'Đơn hàng không thể xử lý vì sản phẩm đã hết hàng.',
    });
    await outOfStockStatus.save();

    // Tạo các trạng thái con (OrderStatusDescription) cho "pending"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: pendingStatus._id,
        code: 'waiting_for_payment',
        description: 'Đơn hàng đang chờ thanh toán từ khách hàng.',
      },
      {
        orderStatusId: pendingStatus._id,
        code: 'waiting_for_shipping',
        description: 'Đơn hàng đã thanh toán và đang chờ giao hàng.',
      }
    ]);

    // Tạo các trạng thái con (OrderStatusDescription) cho "processing"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: processingStatus._id,
        code: 'packing',
        description: 'Đơn hàng đang được đóng gói.',
      },
      {
        orderStatusId: processingStatus._id,
        code: 'ready_for_shipping',
        description: 'Đơn hàng đã sẵn sàng để giao.',
      }
    ]);

    // Tạo các trạng thái con (OrderStatusDescription) cho "shipped"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: shippedStatus._id,
        code: 'on_the_way',
        description: 'Đơn hàng đang trên đường giao đến bạn.',
      }
    ]);

    // Tạo các trạng thái con (OrderStatusDescription) cho "delivered"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: deliveredStatus._id,
        code: 'delivered_successfully',
        description: 'Đơn hàng đã được giao thành công.',
      }
    ]);

    // Tạo các trạng thái con (OrderStatusDescription) cho "cancelled"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: cancelledStatus._id,
        code: 'waiting_for_confirmation',
        description: 'Đơn hàng đang chờ xác nhận hủy.',
      },
      {
        orderStatusId: cancelledStatus._id,
        code: 'failed',
        description: 'Đơn hàng bị hủy do lỗi hệ thống hoặc không đủ điều kiện.',
      }
    ]);

    // Tạo các trạng thái con (OrderStatusDescription) cho "refunded"
    await OrderStatusDescription.insertMany([
      {
        orderStatusId: refundedStatus._id,
        code: 'refunded_successfully',
        description: 'Đơn hàng đã được hoàn tiền sau khi hủy.',
      }
    ]);

    console.log('✅ Đã tạo trạng thái và mô tả trạng thái con thành công.');
  } catch (err) {
    console.error('❌ Lỗi khi tạo OrderStatus hoặc OrderStatusDescription:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedOrderStatusesAndDescriptions();  // Tạo OrderStatus và OrderStatusDescription