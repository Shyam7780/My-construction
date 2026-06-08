const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// 1. एडमिन रजिस्टर करने का रूट (सिर्फ पहली बार इस्तेमाल के लिए)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // चेक करें कि एडमिन पहले से तो नहीं है
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists!" });

    // पासवर्ड को हैश (secure) करें
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // नया एडमिन सेव करें
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();
    
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. एडमिन लॉगिन करने का रूट
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ईमेल चेक करें
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found!" });

    // पासवर्ड चेक करें
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

    // लॉगिन सफल होने पर JWT टोकन बनाएं
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, admin: { email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;