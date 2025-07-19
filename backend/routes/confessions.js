const { DateTime } = require('luxon');

const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession')
router.use(express.json())

function getNextPostTime() {
  const now = DateTime.now().setZone('America/Los_Angeles');
  let target = now.set({ hour: 20, minute: 0, second: 0, millisecond: 0 });
  // move to next day if past desired time
  if (now > target) {
    target = target.plus({ days: 1 });
  }
  return target.toJSDate();
}


// Should be periodically called to schedule confessions to be posted
router.post('/post-batch', async (req, res) => {
  try {
    const BATCH_SIZE = 20
    const MAX_DAYS = 5
    const NUM_CONFESSIONS_PER_POST = 10
    const RESIDENCES = ['TotemPark', 'OrchardCommons', 'PlaceVanier']
    const summary = []

    for (const residence of RESIDENCES) {
      const unposted = await Confession.find({
        residence: residence,
        posted: false,
        scheduledPostAt: { $exists: false }
      })
      const unpostedCount = unposted.length
      const mostRecent = await Confession.findOne({
        residence: residence,
        scheduledPostAt: { $exists: true }
      }).sort({ scheduledPostAt: -1, postID: -1 })
      const daysSinceLastPost = mostRecent
        ? (Date.now() - new Date(mostRecent.scheduledPostAt)) / (1000 * 60 * 60 * 24) // TODO check if this line workds as intended
        : Infinity

      if (unpostedCount >= BATCH_SIZE || daysSinceLastPost >= MAX_DAYS) {
        const nextScheduledTime = getNextPostTime();
        const confessionsToSchedule = unposted.sort({ submittedAt: 1 });
        let newPostID = mostRecent ? mostRecent.postID + 1 : 1
        let confessionIndex = 1;
        for (let i = 0; i < confessionsToSchedule.length; i++) {
          const confession = confessionsToSchedule[i];
          confession.scheduledPostAt = nextScheduledTime;
          confession.postID = newPostID;
          confession.confessionIndex = confessionIndex
          await confession.save();
          if (confessionIndex == NUM_CONFESSIONS_PER_POST) {
            postID++;
            confessionIndex = 1;
          }
        }
        summary.push({
          residence,
          scheduled: true,
          count: confessionsToSchedule.length,
          scheduledPostAt: nextScheduledTime,
        });
      } else {
        summary.push({
          residence,
          scheduled: false,
          message: 'Not enough confessions or not enough time passed',
        });
      }
    }

    res.status(200).json({ summary })
  } catch (err) {
    console.error('Failed to schedule batch', err)
    res.status(500).json({
      error: "Server error during batch scheduling"
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const { residence, content } = req.body;

    if (!residence || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newEntry = new Confession({ content, residence });
    await newEntry.save();
    res.status(201).json({
      success: true,
      confession: newEntry,
      id: newEntry._id
    });

  } catch (err) {
    console.error('❌ POST /confessions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
})

router.get('/', async (req, res) => {
  const { residence } = req.query

  const confessions = await Confession.find({
    residence: residence,
    scheduledPostAt: { $lte: new Date() }
  }).sort({ postID: 1, confessionIndex: 1})
  res.json(confessions)
});

module.exports = router;