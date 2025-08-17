// jobs/conditionallyStart.js
const { DateTime } = require('luxon');
const Confession = require('../models/Confession');
const { tonight7pmUTC, dateKeyFor, isBefore7pmLocal, startOfTodayUTC, endOfTodayUTC } = require('../utils/time');
const { slug } = require('../utils/slug');
const { getNextSeq } = require('../utils/counters');

// thresholds (override via env if you like)
const DAYS_THRESHOLD  = Number(process.env.DAYS_THRESHOLD  || 5);   // drop if >= X days since last posted
const COUNT_THRESHOLD = Number(process.env.COUNT_THRESHOLD || 30);  // OR if >= X unposted
const MAX_PER_POST    = Number(process.env.MAX_PER_POST    || 10);  // chunk size per residence

module.exports = async function conditionallyStart() {
  // 1) Should we drop tonight?
  const last = await Confession.findOne({ state: 'posted' }).sort({ postedAt: -1 }).lean();
  const daysSince = last
    ? DateTime.fromJSDate(new Date()).diff(DateTime.fromJSDate(last.postedAt), 'days').days
    : Infinity;

  const unpostedCount = await Confession.countDocuments({ state: 'unposted' });
  const needsDrop = (daysSince >= DAYS_THRESHOLD) || (unpostedCount >= COUNT_THRESHOLD);
  if (!needsDrop) return;
  if (!isBefore7pmLocal()) return; // only stage before 7pm local

  // 2) If anything already staged for today, do nothing (MVP behavior)
  const startUTC = startOfTodayUTC();
  const endUTC   = endOfTodayUTC();
  const already = await Confession.exists({ state: 'staged', postedAt: { $gte: startUTC, $lte: endUTC } });
  if (already) return;

  // 3) Pick all unposted (oldest first)
  const pick = await Confession.find({ state: 'unposted' }).sort({ submittedAt: 1 }).lean();
  if (!pick.length) return;

  const postedAt = tonight7pmUTC();     // JS Date in UTC for today 7pm PT
  const dateKey  = dateKeyFor(postedAt); // "YYYY-MM-DD"

  // 4) Group by residence and chunk
  const byRes = new Map();
  for (const c of pick) {
    const r = slug(c.residence);
    if (!byRes.has(r)) byRes.set(r, []);
    byRes.get(r).push(c);
  }

  const ops = [];
  for (const [resSlug, arr] of byRes) {
    for (let i = 0; i < arr.length; i += MAX_PER_POST) {
      const chunk = arr.slice(i, i + MAX_PER_POST);
      if (!chunk.length) continue;

      const seq = await getNextSeq(dateKey, resSlug); // 1,2,3...
      const postID = `${dateKey}-${resSlug}-${String(seq).padStart(2,'0')}`;

      chunk.forEach((doc, idx) => {
        ops.push({
          updateOne: {
            filter: { _id: doc._id, state: 'unposted' }, // idempotent guard
            update: {
              $set: {
                state: 'staged',
                postID,
                confessionIndex: idx,
                postedAt,
                stagedAt: new Date(),
              }
            }
          }
        });
      });
    }
  }

  if (ops.length) {
    await Confession.bulkWrite(ops);
    console.log(`[stage] ${dateKey}: staged ${ops.length} items across ${byRes.size} residences`);
  }
};
