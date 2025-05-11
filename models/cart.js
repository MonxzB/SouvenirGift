const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ID của người dùng
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // ID sản phẩm
      quantity: { type: Number, default: 1, required: true }  // Số lượng sản phẩm
    }
  ],
  createdAt: { type: Date, default: Date.now },  // Ngày tạo giỏ hàng
  updatedAt: { type: Date, default: Date.now }   // Ngày cập nhật giỏ hàng cuối cùng
});

module.exports = mongoose.model('Cart', cartSchema);
