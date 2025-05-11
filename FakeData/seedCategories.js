require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');
const connectDB = require('./config/db');
const Category = require('./models/categories');

// Kết nối DB
connectDB();

const seedCategories = async (count = 10) => {
  try {
    await Category.deleteMany(); // Xoá cũ nếu cần

    const fakeCategories = Array.from({ length: count }).map(() => {
      const name = faker.commerce.department();
      return {
        name,
        slug: slugify(name, { lower: true }),
        description: faker.commerce.productDescription(),
        image: faker.image.urlPicsumPhotos({
            width: 640,
            height: 480,
            grayscale: false,
            blur: 0,
          })
          
      };
    });

    await Category.insertMany(fakeCategories);
    console.log(`✅ Đã tạo ${count} danh mục sản phẩm giả.`);
  } catch (err) {
    console.error('❌ Lỗi khi seed category:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedCategories(10);
