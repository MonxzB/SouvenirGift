const Discount = require('../models/discount'); // Đường dẫn đến model Discount

// API tạo mã giảm giá
exports.createDiscount = async (req, res) => {
  try {
    const { code, percentage, description, start_date, end_date, usage_limit } = req.body;

    // Kiểm tra nếu tỷ lệ giảm nằm trong phạm vi hợp lệ
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: 'Tỷ lệ giảm phải nằm trong khoảng từ 0 đến 100.' });
    }

    // Kiểm tra nếu ngày kết thúc nhỏ hơn ngày bắt đầu
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: 'Ngày kết thúc không thể trước ngày bắt đầu.' });
    }

    // Kiểm tra nếu giới hạn sử dụng là số dương
    if (usage_limit <= 0) {
      return res.status(400).json({ message: 'Giới hạn sử dụng phải lớn hơn 0.' });
    }

    // Tạo mã giảm giá mới
    const newDiscount = new Discount({
      code,
      percentage,
      description,
      start_date,
      end_date,
      usage_limit,
      used_count: 0, // Mã giảm giá mới chưa được sử dụng
    });

    // Lưu vào cơ sở dữ liệu
    await newDiscount.save();
    res.status(201).json({ message: 'Mã giảm giá đã được tạo thành công', discount: newDiscount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// API kiểm tra và áp dụng mã giảm giá
exports.applyDiscount = async (req, res) => {
    try {
      const { user_id, discount_code } = req.body;
  
      // Tìm mã giảm giá trong cơ sở dữ liệu
      const discount = await Discount.findOne({ code: discount_code });
  
      if (!discount) {
        return res.status(404).json({ message: 'Mã giảm giá không hợp lệ.' });
      }
  
      // Kiểm tra nếu mã giảm giá đã hết lượt sử dụng
      if (discount.used_count >= discount.usage_limit) {
        // Chuyển trạng thái thành 'inactive' nếu đã hết lượt sử dụng
        discount.active = false;
        await discount.save();
  
        return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });
      }
  
      // Nếu mã giảm giá vẫn còn lượt sử dụng, tăng số lượt sử dụng lên
      discount.used_count += 1;
  
      // Kiểm tra lại nếu số lượt sử dụng đạt giới hạn, tự động vô hiệu hóa
      if (discount.used_count >= discount.usage_limit) {
        discount.active = false;  // Vô hiệu hóa mã giảm giá khi đạt giới hạn
      }
  
      await discount.save();
  
      res.status(200).json({
        user_id,
        message: 'Mã giảm giá áp dụng thành công.',
        discount,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

