// models/Referrer.js
const mongoose = require('mongoose');

const ReferrerSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true, index: true },
  code:        { type: String, required: true, unique: true }, // signed JWT
  shareUrl:    { type: String, required: true },
  entries:     { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Referrer', ReferrerSchema);
