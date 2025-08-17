// jobs/postAndNotify.js
const Confession = require('../models/Confession');
const PushToken = require('../models/PushToken');
const Sent = require('../models/Sent');
const { sendPushToAll } = require('../utils/notify');

module.exports = async function postAndNotify() {
  const now = new Date();

  // group ready staged posts by postID
  const groups = await Confession.aggregate([
    { $match: { state: 'staged', postedAt: { $lte: now } } },
    { $group: { _id: '$postID', count: { $sum: 1 } } },
  ]);

  if (!groups.length) return;

  for (const { _id: postID } of groups) {
    // idempotency: only once per postID
    const already = await Sent.exists({ postID });
    if (already) continue;

    // flip staged -> posted (idempotent because we match state)
    await Confession.updateMany(
      { postID, state: 'staged' },
      { $set: { state: 'posted' } }
    );

    // send push to all subscribed devices
    const tokens = await PushToken.find({ subscribed: true }).lean();
    await sendPushToAll(tokens.map(t => t.token), {
      title: 'New confessions are live',
      body: 'Tap to read the latest batch.',
      data: { route: 'Confessions', postID },
    });

    // record that we've sent for this postID
    await Sent.create({ postID, sentAt: new Date() });
    console.log(`[notify] ${postID}: pushed to ${tokens.length} devices`);
  }
};
