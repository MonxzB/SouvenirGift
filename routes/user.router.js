const express = require('express');
const router = express.Router();
const { getAllUser,getUserById,updateUser,deleteUser } = require('../controllers/auth');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/',authMiddleware, roleMiddleware('admin', 'staff'), getAllUser);
router.get('/:id', getUserById);
router.put('/update/:id', updateUser);
router.delete('/del/:id',authMiddleware, roleMiddleware('admin', 'staff'), deleteUser);

module.exports = router;
