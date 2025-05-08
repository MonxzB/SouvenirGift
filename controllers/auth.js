const bcrypt = require('bcrypt');
const User = require('../models/users');
const Otp = require('../models/otp');
const sendEmail = require('../utils/sendEmail');
const sendOtpEmail = require('../utils/sendOtpEmail');
const verifyEmailWith = require('../utils/verifyEmail'); // <--- thêm dòng này
const { format } = require('date-fns');
const jwt = require('jsonwebtoken');


//Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Kiểm tra email có tồn tại thật không bằng 
    const checkEmailExist = await verifyEmailWith(email);
    if (checkEmailExist !== 'valid') {
      return res.status(400).json({
        message: `Địa chỉ email không hợp lệ (Lỗi: ${checkEmailExist}).`
      });
    }

    // Kiểm tra email đã đăng ký chưa
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Mã hoá mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Tạo user mới chưa xác thực
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      verified: false,
    });

    // Gửi email chào mừng
    // 5. Sinh mã OTP 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. Lưu OTP vào DB (có hiệu lực 5 phút)
    await Otp.deleteMany({ email }); // xoá mã cũ nếu có
    await Otp.create({ email, code: otpCode });

    // 7. Gửi mã OTP qua email
    try {
      await sendOtpEmail(email, otpCode);
    } catch (emailErr) {
      console.error('❌ Gửi OTP thất bại:', emailErr.message);
      await User.findByIdAndDelete(user._id); // rollback user nếu cần
      await Otp.deleteMany({ email });
      return res.status(500).json({
        message: 'Không thể gửi mã OTP đến email. Vui lòng thử lại.',
        error: emailErr.message
      });
    }
    // ✅ Tạo token đăng nhập
    const token = jwt.sign(
      { id: user._id, role: user.role },
        process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Trả kết quả
    res.status(201).json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
    }

    // 1. Tìm mã OTP phù hợp
    const otpRecord = await Otp.findOne({ email, code });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    // 2. Xác thực user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (user.verified) {
      return res.status(200).json({ message: 'Tài khoản đã được xác thực trước đó.' });
    }

    user.verified = true;
    await user.save();

    // 3. Xoá mã OTP sau khi dùng
    await Otp.deleteMany({ email });

    // 4. Trả kết quả
    res.status(200).json({ message: '✅ Xác thực thành công. Bạn có thể đăng nhập!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

//Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Kiểm tra email có trong DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // ✅ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // ✅ Tạo token đăng nhập
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Trả kết quả
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

// Lấy thông tin tất cả người dùng
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();  // Lấy tất cả người dùng từ cơ sở dữ liệu
    const countUser = await User.countDocuments();
    if (users.length === 0) {  // Kiểm tra nếu mảng người dùng rỗng
      return res.status(404).json({ msg: 'No users found' });
    }

    // Trả về danh sách người dùng với các thông tin cần thiết
    const userDetails = users.map(user => ({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      role: user.role,
      createdAt: format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')  // Định dạng ngày tháng
    }));

    res.json({
      countUser,
      userDetails
    });  // Trả về danh sách người dùng đã xử lý
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      role: user.role,
      createdAt: format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')  // Định dạng ngày tháng
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  const { name, email, address, phone, role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Cập nhật thông tin người dùng
    user.name = name || user.name;
    user.email = email || user.email;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    updatedAt= format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss')  // Định dạng ngày tháng


    await user.save();
    res.json({ msg: 'User updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.deleteOne({ _id: req.params.id });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};