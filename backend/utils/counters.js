// utils/counters.js
const Counter = require('../models/Counter'); // {_id: "YYYY-MM-DD:res-slug", seq: Number}

async function getNextSeq(dateKey, resSlug) {
  const id = `${dateKey}:${resSlug}`;
  const doc = await Counter.findOneAndUpdate(
    { _id: id },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq; // 1,2,3...
}
module.exports = { getNextSeq };
