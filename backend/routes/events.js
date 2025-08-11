const express = require('express')
const router = express.Router();
const Event = require('../models/Event')
const { DateTime } = require('luxon');


router.use(express.json())

// TODO retest event api
router.get('/', async (req, res) => {
  let { fromDate, maxDaysToCheck = 90, maxResults = 7 } = req.query;

  try {
    const from = fromDate
      ? DateTime.fromISO(fromDate, { zone: 'America/Vancouver' })
      : DateTime.now().setZone('America/Vancouver').startOf('day');

    if (!from.isValid) {
      return res.status(400).json({ error: "Invalid fromDate format" });
    }

    const to = from.plus({ days: parseInt(maxDaysToCheck) });

    const events = await Event.find({
      startAt: {
        $gte: from.toJSDate(),
        $lte: to.toJSDate()
      }
    })
      .sort({ startAt: 1 })
      .limit(parseInt(maxResults));

    return res.status(200).json({
      message: "Success",
      events
    });

  } catch (err) {
    console.error("Error in /next7days:", err);
    return res.status(500).json({ error: "Server error while fetching events" });
  }
});



router.get('/singleDay', async (req, res) => {
  const { dateString } = req.query;

  if (!dateString) {
    return res.status(400).json({ error: "dateString field required" });
  }

  try {
    const events = await Event.find({ date: dateString }).sort({ startTime: 1 });


    return res.status(200).json({
      message: "Success",
      events: events
    });

  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ error: "Server error while fetching events" });
  }
});


router.post('/', async (req, res) => {
  try {
    const { shortcode, title, startAt, location } = req.body
    if (!shortcode || !startAt) {
      return res.status(400).json({ error: "not all required fields provided" })
    }

    const newEntry = new Event({ shortcode, title, startAt, location })
    await newEntry.save()
    return res.status(201).json({ message: "Success", event: newEntry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Event with that shortcode and startAt already exists' });
    }
    console.error(err)
    res.status(500).json({ error: 'Server error' });
  }
})

module.exports = router