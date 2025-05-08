require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');
const connectDB = require('./config/db');
const Product = require('./models/products');
const Category = require('./models/categories');

// Kết nối DB
connectDB();

const seedProducts = async (count = 50) => {
  try {
    await Product.deleteMany(); // Xoá sản phẩm cũ

    const categories = await Category.find(); // Lấy danh mục hiện có

    if (!categories.length) {
      console.error('⚠️ Không tìm thấy danh mục nào. Vui lòng seed Category trước.');
      return;
    }

    const fakeProducts = Array.from({ length: count }).map(() => {
      const name = faker.commerce.productName();
      const category = faker.helpers.arrayElement(categories);
      return {
        name,
        slug: slugify(name, { lower: true }),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 200, dec: 0 })),
        stock: faker.number.int({ min: 0, max: 100 }),
        category: category.name,
        category_id: category._id,
        image: faker.image.urlPicsumPhotos(),
        active: true,
      };
    });

    await Product.insertMany(fakeProducts);
    console.log(`✅ Đã tạo ${count} sản phẩm giả.`);
  } catch (err) {
    console.error('❌ Lỗi khi seed product:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedProducts(50);
