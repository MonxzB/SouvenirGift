const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderLogSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'orders',
    required: true,
  },
  status_id: {
    type: Schema.Types.ObjectId,
    ref: 'order_statuses',
    required: true,
  },
  changed_by: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    default: null,
  },
  note: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
},{ timestamps: true });

module.exports = mongoose.model('order_logs', OrderLogSchema);
