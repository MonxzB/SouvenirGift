const express = require('express');
const router = express.Router();
const { createDiscount } = require('../controllers/discount'); // Đường dẫn đến controller

// Route tạo mã giảm giá cho admin
router.post('/create', createDiscount);

module.exports = router;
