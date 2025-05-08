const mongoose = require('mongoose');
const orderStatusSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  label: { type: String },
  color: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);