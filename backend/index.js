// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { PT } = require('./utils/time'); // timezone string for cron
const Event = require('./models/Event'); // unchanged

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

// Routes (unchanged)
const confessionsRoute = require('./routes/confessions');
app.use('/api/confessions', confessionsRoute);
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);
const eventsRoute = require('./routes/events');
app.use('/api/events', eventsRoute);
app.use(require('./shareRoutes'));

// ✅ NEW: push registration endpoint (for Expo tokens)
app.use('/push', require('./routes/push'));

// ---- Jobs (wired in below after server starts) ----
const conditionallyStage = require('./jobs/conditionallyStage'); // stages tonight's posts if needed
const postAndNotify = require('./jobs/postAndNotify');           // flips to posted & sends push

function startSchedulers() {
  // Every 10 minutes: decide whether to stage tonight (safe to run multiple times)
  cron.schedule('*/10 * * * *', () => {
    conditionallyStage().catch(err => console.error('[cron] conditionallyStage error:', err));
  }, { timezone: PT });

  // Every minute: if time has arrived, post & push (idempotent)
  cron.schedule('* * * * *', () => {
    postAndNotify().catch(err => console.error('[cron] postAndNotify error:', err));
  }, { timezone: PT });

  console.log('⏰ Cron schedulers started');
}

// ⛔️ Only connect to MongoDB and start server if NOT running in test mode
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ MongoDB connected');

      // ✅ OPTIONAL: create/sync indexes at boot (turn on with env flags)
      // Use ONE of these blocks when you need to update indexes in prod:
      if (process.env.SYNC_INDEXES === 'true') {
        const Confession = require('./models/Confession');
        const PushToken  = require('./models/PushToken');
        const Sent       = require('./models/Sent');
        const Counter    = require('./models/Counter');
        // WARNING: syncIndexes will DROP indexes not defined in schema.
        await Confession.syncIndexes();
        await PushToken.syncIndexes();
        await Sent.syncIndexes();
        await Counter.syncIndexes();
        console.log('✅ Indexes synced (syncIndexes)');
      } else if (process.env.CREATE_INDEXES === 'true') {
        const Confession = require('./models/Confession');
        const PushToken  = require('./models/PushToken');
        const Sent       = require('./models/Sent');
        const Counter    = require('./models/Counter');
        await Confession.createIndexes();
        await PushToken.createIndexes();
        await Sent.createIndexes();
        await Counter.createIndexes();
        console.log('✅ Indexes created if missing (createIndexes)');
      }

      const port = process.env.PORT || 10000;
      app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);

        // start cron only when this process should run jobs
        if (process.env.RUN_CRON !== 'false') startSchedulers();
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
    });
}

module.exports = app; // ✅ Export app so Supertest can use it in tests

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Event = require('./models/Event')

// // Load .env only in dev/run mode, not in test
// if (require.main === module) {
//   require('dotenv').config();
// }

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Root route (for testing)
// app.get('/', (req, res) => {
//   res.send('UBC First Year Life backend is live');
// });

// // health
// app.get('/health', (_, res) => res.send('ok'));

// // Routes
// const confessionsRoute = require('./routes/confessions');
// app.use('/api/confessions', confessionsRoute);
// const postsRoute = require('./routes/posts');
// app.use('/api/posts', postsRoute);
// const eventsRoute = require('./routes/events');
// app.use('/api/events', eventsRoute);
// app.use(require('./shareRoutes'));

// // ⛔️ Only connect to MongoDB and start server if NOT running in test mode
// if (require.main === module) {
//   mongoose.connect(process.env.MONGO_URI)
//     .then( () => {
//       console.log('✅ MongoDB connected');
//       // await Event.init();
      
//       app.listen(process.env.PORT || 10000, () => {
//         console.log(`🚀 Server running on port ${process.env.PORT || 10000}`);
//       });
//     })
//     .catch(err => {
//       console.error('❌ MongoDB connection error:', err);
//     });
// }



// module.exports = app; // ✅ Export app so Supertest can use it in tests
