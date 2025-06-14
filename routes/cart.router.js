const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addToCart,getUserCart, removeFromCart, updateCartQuantity } = require('../controllers/cart');

// Thêm sản phẩm vào giỏ hàng
router.post('/add', auth, addToCart);

// Lấy sản phẩm trong giỏ hàng
router.get('/', auth, getUserCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', auth, removeFromCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update/:productId', auth, updateCartQuantity);

module.exports = router;
