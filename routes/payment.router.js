const express = require("express");
const router = express.Router();
const { handleWebhook, cancelOrderByPayOS } = require("../controllers/payment"); // Đường dẫn đến controller xử lý webhook

// Route xử lý webhook thanh toán từ PayOS
router.post('/payos/webhook', handleWebhook);
// routes/payment.routes.js
router.get('/cancel', cancelOrderByPayOS);  // PayOS callback


module.exports = router;
