const Comment = require('../models/Comment');


exports.createComment = async (req, res) => {
  try {    
    const { product_id, rating, content } = req.body;
    const user_id = req.user._id;

    // Kiểm tra thiếu trường nào
    if (!product_id || !rating || !content) {
      return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Tạo comment mới
    const newComment = new Comment({
      product_id,
      user_id,
      rating,
      content
    });

    await newComment.save();

    res.status(201).json({ msg: 'Đánh giá đã được thêm', comment: newComment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error111' });
  }
};

//Lấy tất cả cmt
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    const count = await Comment.countDocuments();
    
    if (comments.length === 0) {
      return res.status(404).json({ msg: 'No products found' });
    }
    res.json({
      count,
      comments,
    });  // Trả về danh sách tất cả cmt
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};  
