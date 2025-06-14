const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_code: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  total_amount: { 
    type: Number, 
    required: true 
  },
  discount_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discount' 
  },
  payment_status: { 
    type: String, 
    enum: ['unpaid', 'paid'], 
    default: 'unpaid' 
  },
  payment_method: { 
    type: String, 
    enum: ['cod', 'payos'], 
    required: true 
  },
  status_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OrderStatus', 
    required: true 
  },  // Trạng thái chính
  shipping_address: { 
    type: String, 
    required: true 
  },
items: [{
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
