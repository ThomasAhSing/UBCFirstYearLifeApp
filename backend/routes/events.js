const express = require('express')
const router = express.Router();
const Event = require('../models/Event')

router.use(express.json())


router.get('/next7days', async (req, res) => {
    const { dateString } = req.query
    if (!dateString) {
        return res.status(400).json({ error: "dateString field required" })
    }
    const fromDate = new Date(dateString)
    const results = {}

    const maxDaysToCheck = 30
    const maxResults = 7
    for (let i = 0; i < maxDaysToCheck && Object.keys(results).length < maxResults; i++) {
        const checkDate = new Date(fromDate)
        checkDate.setDate(fromDate.getDate() + i)

        const dateStringKey = checkDate.toISOString().split('T')[0];

        const events = await Event.find({ date: dateStringKey }).sort({ startTime: 1 })
        if (events.length > 0) {
            results[dateStringKey] = events
        }
    }
    res.json(results)
})

router.get('/singleDay', async (req, res) => {
    const { dateString } = req.query
    if (!dateString) {
        return res.status(400).json({ error: "dateString field required" })
    }
    const results = {}

    const events = await Event.find({ date: dateString }).sort({ startTime: 1 })
    if (events.length > 0) {
        results[dateString] = events
    }
    res.json(results)
})

router.post('/', async (req, res) => {
    try {
        const { shortcode, title, date, startTime, location } = req.body
        if (!shortcode || !title || !date || !startTime || !location) {
            return res.status(400).json({ error: "not all required fields provided" })
        }

        const newEntry = new Event({ shortcode, title, date, startTime, location })
        await newEntry.save()
        return res.status(201).json({message: "Success", event: newEntry});
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Event with that shortcode already exists' });
        }
        console.error(err)
        res.status(500).json({ error: 'Server error' });

    }
})

module.exports = router