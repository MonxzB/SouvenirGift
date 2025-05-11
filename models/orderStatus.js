const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },  // Mã trạng thái, ví dụ: "pending", "processing", "shipped", v.v.
  label: { 
    type: String, 
    required: true 
  },  // Nhãn trạng thái, ví dụ: "Chờ xử lý", "Đang xử lý", "Đang giao"
  description: { 
    type: String, 
    required: true 
  },  // Mô tả trạng thái chính
}, { timestamps: true });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
