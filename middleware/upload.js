const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Hàm tạo middleware upload riêng cho từng thư mục
const createUploader = (folderPath) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderPath,          // Đường dẫn thư mục lưu ảnh trong Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png'], // Định dạng ảnh cho phép
      transformation: [{ width: 500, height: 500, crop: 'limit' }]  // Thay đổi kích thước ảnh
    }
  });

  // Cấu hình Multer với CloudinaryStorage
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Giới hạn kích thước file (5MB)
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
        console.log('File không hợp lệ: chỉ hỗ trợ ảnh JPG, JPEG, PNG');
        return cb(new Error('Chỉ hỗ trợ ảnh JPG, JPEG, PNG'), false);
      }
      cb(null, true);
    }
  });

  return upload;
};

module.exports = createUploader;
