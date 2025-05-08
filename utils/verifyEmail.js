const axios = require('axios');

const verifyEmail = async (email) => {
  const apiKey = process.env.CHECKEMAIL_API_KEY;
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;

  try {
    const { data } = await axios.get(url);

    if (data.is_valid_format?.value && data.is_smtp_valid?.value) {
      return 'valid';
    } else {
      return 'invalid';
    }
  } catch (err) {
    console.error('AbstractAPI error:', err.message);
    return 'unknown';
  }
};

module.exports = verifyEmail;
