const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/payment"); // Đường dẫn đến controller xử lý webhook

// Route xử lý webhook thanh toán từ PayOS
router.post('/payos/webhook', handleWebhook);

module.exports = router;
