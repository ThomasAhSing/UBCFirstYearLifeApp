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
    // group ready staged posts by postID
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

    for (const { _id: postID, count } of groups) {
      // Per-group isolation: a failure here won't abort other groups
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
        console.log(`[post] flipped staged→posted for postID=${postID} | modified=${flipped}`);

        // send push to all subscribed devices (defensive: treat non-array as empty)
        const tokenDocs = await PushToken.find({ subscribed: true }).lean();
        const tokens = Array.isArray(tokenDocs) ? tokenDocs.map(t => t.token) : [];
        console.log(`[post] sending push to ${tokens.length} devices for postID=${postID}`);

        await sendPushToAll(tokens, {
          title: 'New confessions are live',
          body: 'Tap to read the latest batch.',
          data: { route: 'Confessions', postID },
        });
        console.log(`[post] push dispatched for postID=${postID}`);

        // record that we've sent for this postID
        await Sent.create({ postID, sentAt: new Date() });
        console.log(`[post] recorded Sent for postID=${postID}`);
      } catch (e) {
        // Do not rethrow—continue with remaining groups
        console.error(`[post] ERROR in postID=${postID}:`, e);
      }
    }
  } catch (e) {
    // Top-level safety: log and exit this tick, cron will retry next minute
    console.error('[post] FATAL in aggregation or outer loop:', e);
  } finally {
    console.log('──────── [post] END ─────────');
  }
};
