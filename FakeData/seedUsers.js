require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const User = require('./models/users'); // Đường dẫn đến model User
const connectDB = require('./config/db');


// Kết nối MongoDB
connectDB();


const roles = ['customer', 'admin', 'staff'];

const seedUsers = async (count = 20) => {
  try {
    await User.deleteMany({}); // Xoá toàn bộ user cũ nếu cần

    const fakeUsers = await Promise.all(
      Array.from({ length: count }).map(async () => {
        const hashedPassword = await bcrypt.hash('123456', 10); // Mật khẩu mặc định
        return {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: hashedPassword,
          phone: faker.phone.number('09########'),
          address: faker.location.streetAddress(),
          role: faker.helpers.arrayElement(roles),
          created_at: new Date(),
        };
      })
    );

    await User.insertMany(fakeUsers);
    console.log(`✅ Đã tạo ${count} users giả.`);
  } catch (err) {
    console.error('❌ Lỗi khi tạo user:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedUsers(100);
