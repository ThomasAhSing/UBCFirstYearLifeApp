const mongoose = require('mongoose')

const confessionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  residence: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  posted: { type: Boolean, default: false },
  postedAt: { type: Date },
  postID: { type: Number },
  confessionIndex: { type: Number },
  previewImage: { type: String },
});

module.exports = mongoose.model('Confession', confessionSchema)