// models/EventLog.js
const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
  code:        { type: String, index: true },
  type:        { type: String, enum: ['click', 'click_credited'], required: true },
  ip:          String,
  ua:          String,
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventLog', EventLogSchema);
