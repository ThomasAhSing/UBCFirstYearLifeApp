// models/ClickCredit.js
const mongoose = require('mongoose');

const ClickCreditSchema = new mongoose.Schema({
  code:          { type: String, index: true, required: true },
  referrerEmail: { type: String, index: true, required: true },
  day:           { type: String, index: true, required: true }, // 'YYYY-MM-DD' UTC
  ipHash:        { type: String, index: true, required: true }, // sha256(ip|ua)
  createdAt:     { type: Date, default: Date.now },
});

// ensure 1 credit per (code, ipHash, day)
ClickCreditSchema.index({ code: 1, ipHash: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('ClickCredit', ClickCreditSchema);
