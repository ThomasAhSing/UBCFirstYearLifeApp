const express = require('express')
const router = express.Router();
const Post = require('../models/Post')
const { DateTime } = require('luxon');

router.use(express.json())

// TODO add post method for custom upload from phone
// TODO add post method to update isEvent to true for post that is event   

router.get('/', async (req, res) => {
    const DEFAULT_LIMIT = 10;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const now = DateTime.now().setZone('America/Los_Angeles');
    const beforeISO = req.query.before || now.toISO()

    const filter = {}
    filter.timestamp = { $lt: new Date(beforeISO) }

    try {
        const posts = await Post.find(filter).sort({ timestamp: -1 }).limit(limit)
        res.status(200).json({ message: 'Success', posts });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
})

router.get('/:shortcode', async (req, res) => {
  try {
    const post = await Post.findOne({ shortcode: req.params.shortcode });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post by shortcode:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
    try {
        const { shortcode, userFetchedFrom, caption, likes, timestamp, media, profile, isEvent = false } = req.body
        if (!shortcode || !userFetchedFrom || !caption || !likes || !timestamp || !media || !profile) {
            return res.status(400).json({ error: 'Required fields missing to make psot object' });
        }
        const newEntry = new Post({ shortcode, userFetchedFrom, caption, likes, timestamp, media, profile, isEvent })
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