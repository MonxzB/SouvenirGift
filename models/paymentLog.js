const mongoose = require('mongoose');
const paymentLogSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  payos_transaction_id: { type: String },
  status: { type: String },
  raw_data: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);