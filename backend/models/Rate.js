const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  category: { type: String, required: true }, // जैसे: 'Premium', 'Standard'
  item: { type: String, required: true }, // जैसे: 'Cement', 'Steel'
  price: { type: Number, required: true },
  unit: { type: String, required: true } // जैसे: 'sq.ft', 'kg'
});

module.exports = mongoose.model('Rate', rateSchema);