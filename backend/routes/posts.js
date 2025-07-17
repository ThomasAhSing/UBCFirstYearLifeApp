const express = require('express')
const router = express.Router();
const Post = require('../models/Post')

router.use(express.json())

router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const before = req.query.before

    const filter = {}
    if (before) {
        filter.timestamp = { $lt: new Date(before) }
    }

    try {
        const posts = await Post.find(filter).sort({ timestamp: -1 }).limit(limit)
        res.json(posts)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
})

router.post('/', async (req, res) => {
    try {
        const { shortcode, userFetchedFrom, caption, likes, timestamp, media, profile } = req.body
        if (!shortcode || !userFetchedFrom || !caption || !likes || !timestamp || !media || !profile) {
            return res.status(400).json({ error: 'Required fields missing to make psot object' });
        }
        const newEntry = new Post({ shortcode, userFetchedFrom, caption, likes, timestamp, media, profile })
        await newEntry.save()
        return res.status(201).json({message: "Success", event: newEntry});
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Post with that shortcode already exists' });
        }
        console.error(err)
        res.status(500).json({ error: 'Server error' });

    }
})

module.exports = router