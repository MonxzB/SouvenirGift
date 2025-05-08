const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.router');
const userRoutes = require('./user.router');
const categoryRoutes = require('./category.router');


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
