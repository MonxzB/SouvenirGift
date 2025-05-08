// services/sendOtpEmail.js
const sendEmail = require('./sendEmail');

const sendOtpEmail = async (email, otpCode) => {
  const subject = 'Mã OTP xác thực từ Souvenir App';
  const html = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
    <div style="text-align: center; padding: 20px 0;">
      <img src="https://imgur.com/a/lQr9gJg" alt="Souvenir App Logo" style="max-width: 150px; height: auto;" />
    </div>

    <h2>Xin chào bạn,</h2>
    <p>Bạn vừa yêu cầu mã xác thực (OTP) để đăng ký <strong>Souvenir App</strong>.</p>
    <p style="font-size: 18px;">🔐 Mã OTP của bạn là:</p>
    <p style="font-size: 24px; font-weight: bold; color: #1a73e8; text-align: center;">${otpCode}</p>
    <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    <p>Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email hoặc liên hệ với đội hỗ trợ của chúng tôi.</p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 14px; color: #888; text-align: center;">
      Trân trọng,<br/>Đội ngũ <strong>Souvenir App</strong>
    </p>
  </div>
`;
  return await sendEmail(email, subject, html);
};

module.exports = sendOtpEmail;
