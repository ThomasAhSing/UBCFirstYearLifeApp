const mongoose = require('mongoose');

const SentSchema = new mongoose.Schema({
  postID: { type: String, unique: true, index: true },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sent', SentSchema);
