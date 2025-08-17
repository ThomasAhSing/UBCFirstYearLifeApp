const mongoose = require('mongoose');

const PushTokenSchema = new mongoose.Schema({
  token: { type: String, unique: true, index: true },
  subscribed: { type: Boolean, default: true },
  platform: String,
  deviceId: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PushToken', PushTokenSchema);
