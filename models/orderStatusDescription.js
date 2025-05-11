const mongoose = require('mongoose');

const orderStatusDescriptionSchema = new mongoose.Schema({
  orderStatusId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OrderStatus', 
    required: true 
  }, // Tham chiếu đến trạng thái chính của đơn hàng
  code: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Mã trạng thái con
  description: { 
    type: String, 
    required: true 
  }, // Mô tả chi tiết cho trạng thái con
}, { timestamps: true });

module.exports = mongoose.model('OrderStatusDescription', orderStatusDescriptionSchema);
