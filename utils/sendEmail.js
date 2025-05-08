const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Souvenir App" <${process.env.EMAIL_USER}>`, // 🔧 Sửa đúng biến
      to,
      subject,
      html
    });

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error('Email address not accepted by server');
    }

    return info;
  } catch (err) {
    throw new Error(`Email failed: ${err.message}`);
  }
};

module.exports = sendEmail;
