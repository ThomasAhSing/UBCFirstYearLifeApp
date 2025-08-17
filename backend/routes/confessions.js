const { DateTime } = require('luxon');

const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession')
router.use(express.json())

// return whether 7pm of same day if it is before 7pm, or return 7pm of next day
function getNextPostTime() { 
  const now = DateTime.now().setZone('America/Los_Angeles');
  let target = now.set({ hour: 19, minute: 0, second: 0, millisecond: 0 });
  // move to next day if past desired time
  if (now > target) {
    target = target.plus({ days: 1 });
  }
  return target.toJSDate();
}

router.post('/', async (req, res) => {
  try {
    const { residence, content, submittedAt, posted, scheduledPostAt, postID, confessionIndex } = req.body;


    if (!residence || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newEntry = new Confession({ residence, content, submittedAt, posted, scheduledPostAt, postID, confessionIndex });
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
    scheduledPostAt: { $lte: new Date() },
    posted: true
  }).sort({ postID: -1, confessionIndex: 1 })
  res.json(confessions)
});

router.post('/post-staged', async (req, res) => {
  try {
    const now = new Date();
    const result = await Confession.updateMany(
      { posted: false, scheduledPostAt: { $lte: now }},
      { $set: {posted: true}}
    )
    res.status(200).json({
      updatedCount: result.modifiedCount,
      message: `${result.modifiedCount} confessions marked as posted`
    });

  } catch (err) {
    console.error('error making staged posted', err);
    res.status(500).json({ error: 'Server error' });
  }
})


// moved unposted confessions to posted
router.post('/post-batch', async (req, res) => {
  try {
    const {
      BATCH_SIZE = 20,
      MAX_DAYS = 5,
      NUM_CONFESSIONS_PER_POST = 10,
      RESIDENCES = ['TotemPark', 'OrchardCommons', 'PlaceVanier']
    } = req.body;
    const summary = []

    // TODO fix case where there are staged 
    for (const residence of RESIDENCES) {
      const unposted = await Confession.find({
        residence: residence,
        posted: false,
        // scheduledPostAt: { $exists: false }
      })
      const unpostedCount = unposted.length
      const mostRecent = await Confession.findOne({
        residence: residence,
        scheduledPostAt: { $exists: true }
      }).sort({ scheduledPostAt: -1, postID: -1, confessionIndex: -1})
      const daysSinceLastPost = mostRecent
        ? Math.ceil((Date.now() - new Date(mostRecent.scheduledPostAt)) / (1000 * 60 * 60 * 24))
        : Infinity;
      if (unpostedCount >= BATCH_SIZE || daysSinceLastPost >= MAX_DAYS) {
        const nextScheduledTime = getNextPostTime();
        // const confessionsToSchedule = unposted.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        const confessionsToSchedule = await Confession.find({
          residence: residence,
          posted: false,
          scheduledPostAt: { $exists: false }
        }).sort({ submittedAt: 1 });
        let newPostID = 1
        let confessionIndex = 1;
        if (mostRecent) {
          if (mostRecent.posted) {
            newPostID = mostRecent.postID + 1
            confessionIndex = 1
          } else {
            // mostRecent is staged
            newPostID = mostRecent.postID 
            confessionIndex = mostRecent.confessionIndex + 1;
          }
        }


        if (confessionIndex > NUM_CONFESSIONS_PER_POST) {
          newPostID++;
          confessionIndex = 1;
        }
        for (let i = 0; i < confessionsToSchedule.length; i++) {
          if (confessionIndex > NUM_CONFESSIONS_PER_POST) {
            newPostID++;
            confessionIndex = 1;
          }
          const confession = confessionsToSchedule[i];
          confession.scheduledPostAt = nextScheduledTime;
          confession.postID = newPostID;
          confession.confessionIndex = confessionIndex
          await confession.save();
          confessionIndex++;
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
    debugger;
    res.status(500).json({
      error: "Server error during batch scheduling"
    })
  }
})


// get funcitons for testing

router.get('/unposted', async (req, res) => {
  const { residence } = req.query

  const confessions = await Confession.find({
    residence: residence,
    scheduledPostAt: { $exists: false },
    posted: false
  }).sort({ submittedAt: -1 })
  res.json(confessions)
});

// staged means just given postID, scheduledPostAt but posted still false
// get stage
router.get('/staged', async (req, res) => {
  const { residence } = req.query

  const confessions = await Confession.find({
    residence: residence,
    scheduledPostAt: { $exists: true },
    posted: false
  }).sort({ postID: -1, confessionIndex: -1 })
  res.json(confessions)
});

router.get('/posted', async (req, res) => {
  const { residence } = req.query

  const confessions = await Confession.find({
    residence: residence,
    posted: true
  }).sort({ postID: -1, confessionIndex: -1 })
  res.json(confessions)
});

module.exports = router;