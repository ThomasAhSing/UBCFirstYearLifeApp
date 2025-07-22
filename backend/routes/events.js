const express = require('express')
const router = express.Router();
const Event = require('../models/Event')

router.use(express.json())

router.get('/next7days', async (req, res) => {
    const { dateString, maxDaysToCheck = 30, maxResults = 7 } = req.query;
    if (!dateString) {
        return res.status(400).json({ error: "dateString field required" });
    }
    try {
        const fromDate = new Date(dateString);
        const results = {};
        const maxDays = parseInt(maxDaysToCheck);
        const maxCount = parseInt(maxResults);
        for (let i = 0; i < maxDays && Object.keys(results).length < maxCount; i++) {
            const checkDate = new Date(fromDate);
            checkDate.setDate(fromDate.getDate() + i);

            const dateStringKey = checkDate.toISOString().split('T')[0];

            const eventsOnDay = await Event.find({ date: dateStringKey }).sort({ startTime: 1 });
            if (eventsOnDay.length > 0) {
                results[dateStringKey] = eventsOnDay;
            }
        }
        return res.status(200).json({
            message: "Success",
            events: results
        });

    } catch (err) {
        console.error("Error in /next7days:", err);
        return res.status(500).json({ error: "Server error while fetching next 7 days of events" });
    }
});


router.get('/singleDay', async (req, res) => {
    const { dateString } = req.query;

    if (!dateString) {
        return res.status(400).json({ error: "dateString field required" });
    }

    try {
        const events = await Event.find({ date: dateString }).sort({ startTime: 1 });

        // const results = {};
        // if (events.length > 0) {
        //     results[dateString] = events;
        // }

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
        const { shortcode, title, date, startTime, location } = req.body
        if (!shortcode || !date || !startTime ) {
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