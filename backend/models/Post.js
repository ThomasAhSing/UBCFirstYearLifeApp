const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    shortcode: {type: String, required: true},
    userFetchedFrom: {type: String, required: true},
    caption: {type: String, required: true},
    likes: {type: Number, required: true},
    timestamp: {type: Date, required: true},
    

})