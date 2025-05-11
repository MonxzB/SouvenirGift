const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.router');
const userRoutes = require('./user.router');
const categoryRoutes = require('./category.router');
const productRoutes = require('./product.router');
const cartRoutes = require('./cart.router');
const discountRoutes = require('./discount.router');
const orderRoutes = require('./order.router');
const paymentRoutes = require('./payment.router');
const chatRoutes = require('./chat.router');



router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/discount', discountRoutes);
router.use('/order', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/ai', chatRoutes);

module.exports = router;
