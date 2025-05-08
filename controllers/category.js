const Category = require('../models/categories');  // Import Category model

// ✅ Tạo danh mục
exports.createCategory = async (req, res) => {
    try {
      const { name, slug, description } = req.body;
      const image = req.file?.path || null;
  
      // Kiểm tra trùng tên hoặc slug
      const existing = await Category.findOne({ $or: [{ name }, { slug }] });
      if (existing) {
        return res.status(400).json({ message: 'Tên hoặc slug đã tồn tại.' });
      }
  
      const category = await Category.create({ name, slug, description, image });
  
      res.status(201).json({ message: 'Tạo danh mục thành công.', category });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi tạo danh mục.', error: err.message });
    }
  };
  


// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const countCategory = await Category.countDocuments();
    res.status(200).json({
      countCategory,
      categories
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching categories', error: err });
  }
};