const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  percentage: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  description: { 
    type: String, 
    default: null 
  },
  start_date: { 
    type: Date, 
    required: true 
  },
  end_date: { 
    type: Date, 
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  usage_limit: { 
    type: Number, 
    required: true,
    default: 100 // Giới hạn sử dụng
  },
  used_count: { 
    type: Number, 
    default: 0  // Số lượt đã sử dụng
  },
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
