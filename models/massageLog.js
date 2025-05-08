const mongoose = require('mongoose');
const messageLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true },
  answer: { type: String },
  source: { type: String, enum: ['chatbot', 'human'], default: 'chatbot' }
}, { timestamps: true });

module.exports = mongoose.model('MessageLog', messageLogSchema);