// jobs/conditionallyStage.js
const { DateTime } = require('luxon');
const Confession = require('../models/Confession');
const { PT, getTargetDropInfo } = require('../utils/time');
const { slug } = require('../utils/slug');
const { getNextSeq } = require('../utils/counters');

// thresholds (override via env if you like)
const DAYS_THRESHOLD  = Number(process.env.DAYS_THRESHOLD  || 5);   // drop if >= X days since last posted
const COUNT_THRESHOLD = Number(process.env.COUNT_THRESHOLD || 30);  // OR if >= X unposted
const MAX_PER_POST    = Number(process.env.MAX_PER_POST    || 10);  // chunk size per residence

console.log('[stage] env: DAYS_THRESHOLD=%s COUNT_THRESHOLD=%s MAX_PER_POST=%s',
  DAYS_THRESHOLD, COUNT_THRESHOLD, MAX_PER_POST);

module.exports = async function conditionallyStage() {
  console.log('──────── [stage] START ────────');

  // ---- choose target drop (today before cutoff, else tomorrow) ----
  const { targetDropPT, dropAtUTC, dateKey, targetStartUTC, targetEndUTC, cutoffPT } = getTargetDropInfo();
  console.log('[stage] now PT=%s | cutoff PT=%s', DateTime.now().setZone(PT).toISO(), cutoffPT.toISO());
  console.log('[stage] target drop PT=%s (UTC=%s) | dateKey=%s',
    targetDropPT.toISO(), dropAtUTC.toISOString(), dateKey);

  // 1) Should we drop on the target day?
  const last = await Confession.findOne({ state: 'posted' }).sort({ postedAt: -1 }).lean();
  console.log('[stage] last postedAt:', last?.postedAt ? new Date(last.postedAt).toISOString() : 'none');

  const daysSinceAtDrop = last
    ? DateTime.fromJSDate(dropAtUTC).diff(DateTime.fromJSDate(last.postedAt), 'days').days
    : Infinity;
  console.log('[stage] daysSinceAtDrop=%s', Number.isFinite(daysSinceAtDrop) ? daysSinceAtDrop.toFixed(3) : 'Infinity');

  const unpostedCount = await Confession.countDocuments({ state: 'unposted' });
  console.log('[stage] unpostedCount=', unpostedCount);

  const needsDrop =
    (daysSinceAtDrop >= DAYS_THRESHOLD) || (unpostedCount >= COUNT_THRESHOLD);
  console.log('[stage] needsDrop=%s (by days=%s | by count=%s)',
    needsDrop,
    (daysSinceAtDrop >= DAYS_THRESHOLD),
    (unpostedCount >= COUNT_THRESHOLD));
  if (!needsDrop) { console.log('[stage] SKIP: thresholds not met'); console.log('──────── [stage] END ─────────'); return; }

  // 2) If anything already staged for the TARGET day, do nothing
  const already = await Confession.exists({ state: 'staged', postedAt: { $gte: targetStartUTC, $lte: targetEndUTC } });
  console.log('[stage] already staged for dateKey %s ?', dateKey, Boolean(already));
  if (already) { console.log('[stage] SKIP: batch already staged for target day'); console.log('──────── [stage] END ─────────'); return; }

  // 3) Pick all unposted (oldest first)
  const pick = await Confession.find({ state: 'unposted' }).sort({ submittedAt: 1 }).lean();
  console.log('[stage] unposted picked total=', pick.length);
  if (!pick.length) { console.log('[stage] SKIP: no unposted'); console.log('──────── [stage] END ─────────'); return; }

  // 4) Group by residence and chunk
  const byRes = new Map();
  for (const c of pick) {
    const r = slug(c.residence);
    if (!byRes.has(r)) byRes.set(r, []);
    byRes.get(r).push(c);
  }
  for (const [resSlug, arr] of byRes) {
    console.log('[stage] residence=%s total=%d', resSlug, arr.length);
  }

  const ops = [];
  for (const [resSlug, arr] of byRes) {
    for (let i = 0; i < arr.length; i += MAX_PER_POST) {
      const chunk = arr.slice(i, i + MAX_PER_POST);
      if (!chunk.length) continue;

      const seq = await getNextSeq(dateKey, resSlug); // 1,2,3...
      const postID = `${dateKey}-${resSlug}-${String(seq).padStart(2, '0')}`;
      console.log('[stage] plan postID=%s size=%d', postID, chunk.length);

      chunk.forEach((doc, idx) => {
        ops.push({
          updateOne: {
            filter: { _id: doc._id, state: 'unposted' }, // idempotent guard
            update: {
              $set: {
                state: 'staged',
                postID,
                confessionIndex: idx + 1,
                postedAt: dropAtUTC,         // target day @ drop time (UTC)
                stagedAt: new Date(),
              }
            }
          }
        });
      });
    }
  }

  console.log('[stage] total ops to write:', ops.length);

  if (ops.length) {
    await Confession.bulkWrite(ops);
    console.log(`[stage] ${dateKey}: staged ${ops.length} items across ${byRes.size} residences`);
  } else {
    console.log('[stage] nothing to write (no chunks or race)');
  }

  console.log('──────── [stage] END ─────────');
};


// // jobs/conditionallyStage.js
// const { DateTime } = require('luxon');
// const Confession = require('../models/Confession');
// const { tonight7pmUTC, dateKeyFor, isBefore7pmLocal, startOfTodayUTC, endOfTodayUTC } = require('../utils/time');
// const { slug } = require('../utils/slug');
// const { getNextSeq } = require('../utils/counters');

// // thresholds (override via env if you like)
// const DAYS_THRESHOLD = Number(process.env.DAYS_THRESHOLD || 5);   // drop if >= X days since last posted
// const COUNT_THRESHOLD = Number(process.env.COUNT_THRESHOLD || 30);  // OR if >= X unposted
// const MAX_PER_POST = Number(process.env.MAX_PER_POST || 10);  // chunk size per residence

// console.log('[stage] env: DAYS_THRESHOLD=%s COUNT_THRESHOLD=%s MAX_PER_POST=%s',
//   DAYS_THRESHOLD, COUNT_THRESHOLD, MAX_PER_POST);

// module.exports = async function conditionallyStage() {
//   console.log('──────── [stage] START ────────');

//   // 1) Should we drop tonight?
//   const last = await Confession.findOne({ state: 'posted' }).sort({ postedAt: -1 }).lean();
//   console.log('[stage] last postedAt:', last?.postedAt ? new Date(last.postedAt).toISOString() : 'none');

//   const dropAt = tonight7pmUTC(); // JS Date for 7:00 PM PT today
//   console.log('[stage] dropAt (UTC):', dropAt.toISOString());

//   const daysSinceAtDrop = last
//     ? DateTime.fromJSDate(dropAt).diff(DateTime.fromJSDate(last.postedAt), 'days').days
//     : Infinity;
//   console.log('[stage] daysSinceAtDrop=%s', Number.isFinite(daysSinceAtDrop) ? daysSinceAtDrop.toFixed(3) : 'Infinity');


//   const unpostedCount = await Confession.countDocuments({ state: 'unposted' });
//   console.log('[stage] unpostedCount=', unpostedCount);
//   // use this in needsDrop:
//   const needsDrop =
//     (daysSinceAtDrop >= DAYS_THRESHOLD) || (unpostedCount >= COUNT_THRESHOLD);
//   console.log('[stage] needsDrop=%s (by days=%s | by count=%s)',
//     needsDrop,
//     (daysSinceAtDrop >= DAYS_THRESHOLD),
//     (unpostedCount >= COUNT_THRESHOLD));

//   console.log('[stage] isBefore7pmLocal()=', isBefore7pmLocal());
//   if (!needsDrop) { console.log('[stage] SKIP: thresholds not met'); console.log('──────── [stage] END ─────────'); return; }
//   if (!isBefore7pmLocal()) { console.log('[stage] SKIP: after 7pm local'); console.log('──────── [stage] END ─────────'); return; }

//   // 2) If anything already staged for today, do nothing (MVP behavior)
//   const startUTC = startOfTodayUTC();
//   const endUTC = endOfTodayUTC();
//   const already = await Confession.exists({ state: 'staged', postedAt: { $gte: startUTC, $lte: endUTC } });
//   console.log('[stage] already staged today?', Boolean(already));
//   if (already) { console.log('[stage] SKIP: batch already staged today'); console.log('──────── [stage] END ─────────'); return; }

//   // 3) Pick all unposted (oldest first)
//   const pick = await Confession.find({ state: 'unposted' }).sort({ submittedAt: 1 }).lean();
//   console.log('[stage] unposted picked total=', pick.length);
//   if (!pick.length) { console.log('[stage] SKIP: no unposted'); console.log('──────── [stage] END ─────────'); return; }

//   const postedAt = tonight7pmUTC();     // JS Date in UTC for today 7pm PT
//   const dateKey = dateKeyFor(postedAt); // "YYYY-MM-DD"
//   console.log('[stage] dateKey=', dateKey);

//   // 4) Group by residence and chunk
//   const byRes = new Map();
//   for (const c of pick) {
//     const r = slug(c.residence);
//     if (!byRes.has(r)) byRes.set(r, []);
//     byRes.get(r).push(c);
//   }
//   for (const [resSlug, arr] of byRes) {
//     console.log('[stage] residence=%s total=%d', resSlug, arr.length);
//   }

//   const ops = [];
//   for (const [resSlug, arr] of byRes) {
//     for (let i = 0; i < arr.length; i += MAX_PER_POST) {
//       const chunk = arr.slice(i, i + MAX_PER_POST);
//       if (!chunk.length) continue;

//       const seq = await getNextSeq(dateKey, resSlug); // 1,2,3...
//       const postID = `${dateKey}-${resSlug}-${String(seq).padStart(2, '0')}`;
//       console.log('[stage] plan postID=%s size=%d', postID, chunk.length);

//       chunk.forEach((doc, idx) => {
//         ops.push({
//           updateOne: {
//             filter: { _id: doc._id, state: 'unposted' }, // idempotent guard
//             update: {
//               $set: {
//                 state: 'staged',
//                 postID,
//                 confessionIndex: idx + 1,
//                 postedAt,
//                 stagedAt: new Date(),
//               }
//             }
//           }
//         });
//       });
//     }
//   }

//   console.log('[stage] total ops to write:', ops.length);

//   if (ops.length) {
//     await Confession.bulkWrite(ops);
//     console.log(`[stage] ${dateKey}: staged ${ops.length} items across ${byRes.size} residences`);
//   } else {
//     console.log('[stage] nothing to write (no chunks or race)');
//   }

//   console.log('──────── [stage] END ─────────');
// };
