const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, updateOrderStatus,getOrdersByUserId } = require('../controllers/order');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route tạo đơn hàng
router.post('/create', createOrder);
// router.get('/status', getOrderStatus);
router.post('/status', updateOrderStatus);
router.get('/user',authMiddleware, getUserOrders);
router.get('/user/:userId',authMiddleware, roleMiddleware('admin'), getOrdersByUserId);

module.exports = router;
