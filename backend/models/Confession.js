const mongoose = require('mongoose')

const confessionSchema = new mongoose.Schema({
  residence: { type: String, required: true },
  content: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  posted: { type: Boolean, default: false },
  scheduledPostAt: { type: Date },
  postID: { type: Number },
  confessionIndex: { type: Number },
  previewImage: { type: String },
});

module.exports = mongoose.model('Confession', confessionSchema)