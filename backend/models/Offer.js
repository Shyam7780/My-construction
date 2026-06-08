const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }, // इसे false करके आप ऑफर को छुपा सकते हैं
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);