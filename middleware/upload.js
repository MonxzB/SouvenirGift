const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Hàm tạo middleware upload riêng cho từng thư mục
const createUploader = (folderPath) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderPath,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });

  return multer({ storage });
};

module.exports = createUploader;
