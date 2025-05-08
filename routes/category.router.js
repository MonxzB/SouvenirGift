const express = require('express');
const router = express.Router();
const createUploader = require('../middleware/upload');
const uploadCategoryImage = createUploader('souvenir/categories');

const categoryController = require('../controllers/category');

router.post('/create', uploadCategoryImage.single('image'), categoryController.createCategory);
router.get('/', categoryController.getCategories);
// router.get('/:id', categoryController.getCategoryById);
// router.put('/:id', uploadCategoryImage.single('image'), categoryController.updateCategory);
// router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
