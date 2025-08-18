// jobs/postAndNotify.js
const Confession = require('../models/Confession');
const PushToken = require('../models/PushToken');
const Sent = require('../models/Sent');
const { sendPushToAll } = require('../utils/notify');

module.exports = async function postAndNotify() {
  const now = new Date();
  console.log('──────── [post] START ────────');
  console.log('[post] now (UTC)=', now.toISOString());

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
    console.log(
      `[post] flipped staged→posted for postID=${postID} | modified=${flipRes.modifiedCount ?? flipRes.nModified ?? 0}`
    );

    // send push to all subscribed devices
    const tokens = await PushToken.find({ subscribed: true }).lean();
    console.log(`[post] sending push to ${tokens.length} devices for postID=${postID}`);
    await sendPushToAll(tokens.map(t => t.token), {
      title: 'New confessions are live',
      body: 'Tap to read the latest batch.',
      data: { route: 'Confessions', postID },
    });
    console.log(`[post] push dispatched for postID=${postID}`);

    // record that we've sent for this postID
    await Sent.create({ postID, sentAt: new Date() });
    console.log(`[post] recorded Sent for postID=${postID}`);
  }

  console.log('──────── [post] END ─────────');
};
