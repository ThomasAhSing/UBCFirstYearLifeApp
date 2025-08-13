const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/Event')

// Load .env only in dev/run mode, not in test
if (require.main === module) {
  require('dotenv').config();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route (for testing)
app.get('/', (req, res) => {
  res.send('UBC First Year Life backend is live');
});

// health
app.get('/health', (_, res) => res.send('ok'));

// Routes
const confessionsRoute = require('./routes/confessions');
app.use('/api/confessions', confessionsRoute);
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);
const eventsRoute = require('./routes/events');
app.use('/api/events', eventsRoute);
app.use(require('./shareRoutes'));

// ⛔️ Only connect to MongoDB and start server if NOT running in test mode
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then( () => {
      console.log('✅ MongoDB connected');
      // await Event.init();
      
      app.listen(process.env.PORT || 10000, () => {
        console.log(`🚀 Server running on port ${process.env.PORT || 10000}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
    });
}



module.exports = app; // ✅ Export app so Supertest can use it in tests
