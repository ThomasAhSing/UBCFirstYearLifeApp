const mongoose = require('mongoose')

const confessionSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['unposted', 'staged', 'posted'],
    default: 'unposted',
  },
  postID: { type: String },
  confessionIndex: { type: Number },
  residence: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  postedAt: { type: Date },
  content: { type: String, required: true },
  submittedFrom: { type: String, required: true },
});



// 2) Per-post fetch & item order. Partial so it only applies once postID exists.
confessionSchema.index(
  { postID: 1, residence: 1, confessionIndex: 1 },
  { unique: true, partialFilterExpression: { postID: { $exists: true } } }
);
confessionSchema.index(
  { residence: 1, state: 1, postID: -1, confessionIndex: 1 }
);

// 3) (Optional) Unposted admin/queue per residence ordered by submission time
confessionSchema.index({ residence: 1, state: 1, submittedAt: 1 });

module.exports = mongoose.model('Confession', confessionSchema)