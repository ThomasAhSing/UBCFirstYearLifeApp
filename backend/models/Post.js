    const mongoose = require('mongoose')

    // TODO make default profile picture a link to ubc image
    const profileSchema = new mongoose.Schema({
        biography: String,
        profile_pic_url: String
    }, {_id: false})

    const postSchema = new mongoose.Schema({
        shortcode: {type: String, required: true, unique: true},
        userFetchedFrom: {type: String, required: true},
        caption: {type: String, required: true},
        likes: {type: Number, required: true},
        timestamp: {type: Date, required: true},
        media: {type: [String], required: true,
            validate: arr => arr.length > 0},
        profile: {type: profileSchema, required: true},
    });

    module.exports = mongoose.model('Post', postSchema)