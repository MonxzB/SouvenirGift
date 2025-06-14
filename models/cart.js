const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  
      selected: { type: Boolean, default: true },
      quantity: { type: Number, default: 1, required: true } 
    }
  ],
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('Cart', cartSchema);
