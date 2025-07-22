const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    shortcode: { type: String, required: true, unique: true },
    title: { type: String},
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    location: { type: String },
});

module.exports = mongoose.model('Event', eventSchema)