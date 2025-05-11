const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addToCart, removeFromCart, updateCartQuantity } = require('../controllers/cart');

// Thêm sản phẩm vào giỏ hàng
router.post('/add', auth, addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:id', auth, removeFromCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update', auth, updateCartQuantity);

module.exports = router;
