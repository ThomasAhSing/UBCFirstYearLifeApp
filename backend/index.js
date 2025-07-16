const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route (for testing)
app.get('/', (req, res) => {
  res.send('UBC First Year Life backend is live');
});

const confessionsRoute = require('./routes/confessions');
app.use('/api/confessions', confessionsRoute);
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 10000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 10000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
