const Product = require('../models/products');
const Category = require('../models/categories');
const Comment = require('../models/Comment');
// const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');

exports.createProduct = async (req, res) => {
    try {
  
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có ảnh nào được tải lên.' });
      }
  
      const { name, slug, description, price, stock, category, category_id } = req.body;
  
      // Lấy mảng ảnh từ request (đường dẫn ảnh từ Cloudinary)
      const images = req.files.map(file => file.path); // Đây là mảng ảnh, kể cả chỉ có 1 ảnh
  
      // Tạo sản phẩm mới
      const product = new Product({
        name,
        slug,
        description,
        price,
        stock,
        category,
        category_id,
        images,  // Dù chỉ có 1 ảnh hay nhiều ảnh, chúng ta vẫn lưu mảng
        active: true
      });
  
      await product.save();
      res.status(201).json({ message: 'Sản phẩm đã được tạo thành công', product });
    } catch (err) {
      console.error('Error:', err);  // Debug lỗi chi tiết
      res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: err.message });
    }
  };


//Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const count = await Product.countDocuments();
    
    if (products.length === 0) {
      return res.status(404).json({ msg: 'No products found' });
    }
    res.json({
      count,
      products,
    });  // Trả về danh sách tất cả sản phẩm
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};  

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);  // Tìm sản phẩm theo ID
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    // const category = await Product.findById(req.params.id).populate("category_id")
    // product.category = category,
    const comments = await Comment.find({ product_id: req.params.id })
      .populate('_id', 'name') // chỉ lấy name người dùng
      .sort({ createdAt: -1 }); // mới nhất trước
    res.json({
      product,
      comments
    }); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

//Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
      const { name, slug, description, price, stock, category, category_id, active } = req.body;
  
      // Kiểm tra xem có ảnh mới không (nếu có thì cập nhật)
      const images = req.files ? req.files.map(file => file.path) : undefined;  // Nếu có ảnh mới thì lấy từ req.files
  
      // Cập nhật sản phẩm
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,  // ID của sản phẩm cần cập nhật
        {
          name,
          slug,
          description,
          price,
          stock,
          category,
          category_id,
          images,  // Nếu có ảnh mới, lưu vào mảng images
          active
        },
        { new: true }  // Trả về document mới sau khi cập nhật
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ msg: 'Product not found' });  // Nếu không tìm thấy sản phẩm
      }
  
      res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

//Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);  // Tìm và xóa sản phẩm theo ID
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });  // Nếu không tìm thấy sản phẩm
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  