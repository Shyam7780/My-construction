const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (यहाँ हमने auth.js को सर्वर से जोड़ दिया है)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const dataRoutes = require('./routes/data');
app.use('/api/data', dataRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Backend Server is running!');
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected successfully!'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('Server is running!');
});