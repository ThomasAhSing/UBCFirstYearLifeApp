const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    shortcode: { type: String, required: true },
    title: { type: String},
    startAt: {type: Date, required: true },
    location: { type: String },
});

eventSchema.index({ shortcode: 1, startAt: 1 }, { unique: true });

module.exports = mongoose.model('Event', eventSchema)