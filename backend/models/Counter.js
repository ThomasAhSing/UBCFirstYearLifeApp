const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: String,                 // `${yyyy-MM-dd}:${resSlug}`
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', CounterSchema);
