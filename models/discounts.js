const mongoose = require('mongoose');
const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  max_usage: { type: Number },
  used_count: { type: Number, default: 0 },
  expiry_date: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);