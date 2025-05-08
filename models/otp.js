const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: String,
  code: String,
  createdAt: { type: Date, default: Date.now, expires: 300 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Otp', otpSchema);
