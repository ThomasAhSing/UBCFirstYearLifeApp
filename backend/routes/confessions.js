const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession')

router.use(express.json())

router.get('/', async (req, res) => {
  const { residence } = req.query

  const confessions = await Confession.find({
    residence: residence,
    posted: true,
  })
  res.json(confessions)
});

router.post('/', async (req, res) => {
  try {
    const { content, residence } = req.body;

  if (!content || !residence) {
    return res.status(400).json({ error: 'Content and Residence are required' });
  }

  const newEntry = new Confession({ content, residence });
  await newEntry.save();

  res.status(201).json({ success: true, id: newEntry._id });
  } catch (err) {
    console.error('❌ POST /confessions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
})

module.exports = router;