const express = require('express');
const router = express.Router();
const Rate = require('../models/Rate');
const Offer = require('../models/Offer');

// रेट्स लाने के लिए
router.get('/rates', async (req, res) => {
  const rates = await Rate.find();
  res.json(rates);
});

// ऑफर्स लाने के लिए
router.get('/offers', async (req, res) => {
  const offers = await Offer.find({ isActive: true });
  res.json(offers);
});

module.exports = router;