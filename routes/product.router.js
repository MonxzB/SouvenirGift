const express = require('express');
const router = express.Router();
const createUploader = require('../middleware/upload');
const uploadProductImages = createUploader('souvenir/products'); // middleware cho sản phẩm

const productController = require('../controllers/product');

// Route tạo sản phẩm với nhiều ảnh (file 'images')
router.post('/create', uploadProductImages.array('images', 5), productController.createProduct); // 5 là số ảnh tối đa
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/update/:id', productController.updateProduct);
router.delete('/del/:id', productController.deleteProduct);

module.exports = router;
