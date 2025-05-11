const Product = require('../models/products'); // Model MongoDB
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  const { question } = req.body;

  try {
    // Lấy dữ liệu tồn kho thấp
    const products = await Product.find({ stock: { $lt: 5 } });
    const productList = products.map(p => `- ${p.name} (còn ${p.stock} cái)`).join('\n');

    // Chèn vào prompt
    const prompt = `
Bạn là trợ lý ERP nội bộ. Dưới đây là danh sách sản phẩm tồn kho thấp:
${productList}

Người dùng hỏi: "${question}"
Hãy trả lời ngắn gọn, chính xác dựa trên dữ liệu trên.
`;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ message: 'Gemini API Error', error: err.message });
  }
};
