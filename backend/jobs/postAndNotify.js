// jobs/postAndNotify.js
const Confession = require('../models/Confession');
const PushToken = require('../models/PushToken');
const Sent = require('../models/Sent');
const { sendPushToAll } = require('../utils/notify');

module.exports = async function postAndNotify() {
  const now = new Date();
  console.log('──────── [post] START ────────');
  console.log('[post] now (UTC)=', now.toISOString());

  try {
    // group ready staged posts by postID (each postID = residence batch)
    const groups = await Confession.aggregate([
      { $match: { state: 'staged', postedAt: { $lte: now } } },
      { $group: { _id: '$postID', count: { $sum: 1 } } },
    ]);

    console.log('[post] ready groups count =', groups.length, '| postIDs =', groups.map(g => g._id));

    if (!groups.length) {
      console.log('[post] SKIP: no staged groups ready');
      console.log('──────── [post] END ─────────');
      return;
    }

    let totalFlipped = 0;   // track whether anything actually moved to posted
    let processedAny = false;

    for (const { _id: postID, count } of groups) {
      try {
        if (!postID) {
          console.warn('[post] SKIP: encountered group with empty postID');
          continue;
        }

        console.log(`[post] processing postID=${postID} (items=${count})`);

        // idempotency: only once per postID
        const already = await Sent.exists({ postID });
        console.log(`[post] already sent? ${Boolean(already)}`);
        if (already) {
          console.log(`[post] SKIP: already recorded Sent for postID=${postID}`);
          continue;
        }

        // flip staged -> posted (idempotent because we match state)
        const flipRes = await Confession.updateMany(
          { postID, state: 'staged' },
          { $set: { state: 'posted' } }
        );
        const flipped = flipRes?.modifiedCount ?? flipRes?.nModified ?? 0;
        totalFlipped += flipped;
        processedAny = true;
        console.log(`[post] flipped staged→posted for postID=${postID} | modified=${flipped}`);

        // record that we've handled this postID (prevents reprocessing next minute)
        await Sent.create({ postID, sentAt: new Date() });
        console.log(`[post] recorded Sent for postID=${postID}`);

        // ⛔️ NOTE: no per-residence push here anymore
      } catch (e) {
        console.error(`[post] ERROR in postID=${postID}:`, e);
      }
    }

    // ✅ Single push for all residences if *anything* flipped this tick
    if (processedAny && totalFlipped > 0) {
      const tokenDocs = await PushToken.find({ subscribed: true }).lean();
      const tokens = Array.isArray(tokenDocs) ? tokenDocs.map(t => t.token) : [];
      console.log(`[post] sending ONE push to ${tokens.length} devices for all residences (flipped=${totalFlipped})`);

      await sendPushToAll(tokens, {
        title: 'New confessions posted',
        body: 'All residences just posted. Tap to read.',
        data: { route: 'Confessions' } // no per-residence postID now
      });

      console.log('[post] single push dispatched for all residences');
    } else {
      console.log('[post] nothing flipped; no push sent');
    }
  } catch (e) {
    console.error('[post] FATAL in aggregation or outer loop:', e);
  } finally {
    console.log('──────── [post] END ─────────');
  }
};
