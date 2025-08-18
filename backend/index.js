// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { PT } = require('./utils/time'); // America/Los_Angeles
const Event = require('./models/Event'); // unchanged

// Load .env only when running this file directly (not in tests)
if (require.main === module) {
  require('dotenv').config();
}

// ---- Safety: no dry-run pushes in production ----
if (process.env.NODE_ENV === 'production' && process.env.PUSH_DRY_RUN === 'true') {
  console.error('Refusing to start: PUSH_DRY_RUN=true in production');
  process.exit(1);
}

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Health & root ----------
app.get('/', (_req, res) => res.send('UBC First Year Life backend is live'));
app.get('/health', (_req, res) => res.send('ok'));

// ---------- Routes ----------
app.use('/api/confessions', require('./routes/confessions'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use(require('./shareRoutes'));
app.use('/push', require('./routes/push')); // Expo push token registration

// ---------- Jobs ----------
const conditionallyStage = require('./jobs/conditionallyStage'); // stage tonight if needed
const postAndNotify = require('./jobs/postAndNotify');           // flip staged->posted & push

function startSchedulers() {
  console.log(`[cron] registering schedules (timezone=${PT})`);

  // 6:00 PM PT
  cron.schedule('0 18 * * *', () => {
    console.log('[cron] 18:00 PT stage tick → conditionallyStage()');
    conditionallyStage()
      .then(() => console.log('[cron] 18:00 PT stage tick ✓'))
      .catch(err => console.error('[cron] 18:00 PT stage tick ✗', err));
  }, { timezone: PT });

  // 6:30 PM PT backup
  cron.schedule('15 11 * * *', () => {
    console.log('[cron] 18:30 PT backup tick → conditionallyStage()');
    conditionallyStage()
      .then(() => console.log('[cron] 18:30 PT backup tick ✓'))
      .catch(err => console.error('[cron] 18:30 PT backup tick ✗', err));
  }, { timezone: PT });

  // Every minute: post & notify if postedAt <= now
  cron.schedule('* * * * *', () => {
    console.log('[cron] post & notify tick → postAndNotify()');
    postAndNotify()
      .then(() => console.log('[cron] post & notify tick ✓'))
      .catch(err => console.error('[cron] post & notify tick ✗', err));
  }, { timezone: PT });

  console.log('⏰ Cron schedulers started');
}

// ---------- Boot ----------
if (require.main === module) {
  const envSummary = {
    NODE_ENV: process.env.NODE_ENV,
    RUN_CRON: process.env.RUN_CRON,
    PUSH_DRY_RUN: process.env.PUSH_DRY_RUN,
    CREATE_INDEXES: process.env.CREATE_INDEXES,
    SYNC_INDEXES: process.env.SYNC_INDEXES,
    PORT: process.env.PORT || 10000,
  };
  console.log('[boot] env:', envSummary);

  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ MongoDB connected');

      // Optional one-off index maintenance (use env flags when needed)
      if (process.env.SYNC_INDEXES === 'true') {
        const Confession = require('./models/Confession');
        const PushToken  = require('./models/PushToken');
        const Sent       = require('./models/Sent');
        const Counter    = require('./models/Counter');
        // WARNING: syncIndexes drops indexes not in the schema.
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
      } else {
        console.log('ℹ️ Index maintenance: none (set CREATE_INDEXES=true or SYNC_INDEXES=true when needed)');
      }

      const port = Number(process.env.PORT) || 10000;
      app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        if (process.env.RUN_CRON !== 'false') {
          startSchedulers();
        } else {
          console.log('🕒 Cron disabled (RUN_CRON=false).');
        }
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });
}

module.exports = app;

