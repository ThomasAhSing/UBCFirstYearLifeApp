// models/Attribution.js
const mongoose = require('mongoose');

const AttributionSchema = new mongoose.Schema({
  deviceIdHash: { type: String, required: true, unique: true, index: true },
  code:         { type: String, required: true, index: true },   // referral token used
  referrerEmail:{ type: String, required: true, index: true },   // who got the credit
  creditedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attribution', AttributionSchema);
