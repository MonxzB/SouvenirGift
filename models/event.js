const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Nội dung có thể có ảnh, định dạng HTML
  images: [{ type: String }], 
  location: { type: String },
  eventDate: { type: Date }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
