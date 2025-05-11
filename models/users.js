const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  address:  { type: String },
  role:     { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  verified: { type: Boolean, default: false },
  discount_used: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discount', 
    default: null // Mã giảm giá mà user đã sử dụng, nếu có
  },
}, { timestamps: true });

// ✅ TTL index: xoá sau 24h nếu chưa verified
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { verified: false } }
);

module.exports = mongoose.model('User', userSchema);
