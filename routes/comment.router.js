const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// Thêm mới cmt
router.post('/add',auth, commentController.createComment);

// Lấy tất cmt
router.get('/',auth, roleMiddleware('admin', 'staff'), commentController.getAllComments);


module.exports = router;
