const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  category: {type: String},
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: { type: [String] },  // Thay `image` thành `images` để lưu mảng ảnh
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Tự động tạo slug từ tên
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
module.exports = mongoose.model('Product', productSchema);
