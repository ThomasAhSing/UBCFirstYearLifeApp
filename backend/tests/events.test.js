// Required libraries
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Event = require('../models/Event');

let mongoServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
})

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Stop the in-memory server
    await mongoServer.stop();
})

// clear all events in the database
afterEach(async () => {
    await Event.deleteMany()
})

describe('Event API post', () => {
    // TEST 1: POST should create a new Event
    it('should create a new event', async () => {
        let res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y",
            date: "2025-07-13",
            startTime: 540,
        });
        expect(res.statusCode).toBe(201); // 201 = successfully created 
        res = await request(app).get('/api/events/singleDay')
            .query({ dateString: "2025-07-13" })
        const events = res.body.events
        expect(events.length).toBe(1)
        expect(events[0].shortcode).toBe("DKu7HQNhq3y")
        expect(events[0].date).toBe("2025-07-13")
    })

    it('missing field fail', async () => {
        let res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y",
            title: "Soccer match",
            startTime: 540,
            location: "Sienna Field"
        });
        expect(res.statusCode).toBe(400); // 201 = successfully created
    })

    it('duplicate shortcide', async () => {
        let res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y",
            date: "2025-07-13",
            title: "Soccer match",
            startTime: 540,
            location: "Sienna Field"
        });
        res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y",
            date: "2025-07-13",
            title: "Soccer match",
            startTime: 540,
            location: "Sienna Field"
        });

        expect(res.statusCode).toBe(409);
    })

    it('multiple post + test early to late order', async () => {
        let res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y1",
            date: "2025-07-13",
            startTime: 540,
        });
        res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y2",
            date: "2025-07-13",
            startTime: 600,

        });
        res = await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y3",
            date: "2025-07-13",
            startTime: 660,
        });
        expect(res.statusCode).toBe(201); // 201 = successfully created 
        res = await request(app).get('/api/events/singleDay')
            .query({ dateString: "2025-07-13" })
        const events = res.body.events
        expect(events.length).toBe(3)
        expect(events[0].shortcode).toBe("DKu7HQNhq3y1")
        expect(events[1].shortcode).toBe("DKu7HQNhq3y2")
        expect(events[2].shortcode).toBe("DKu7HQNhq3y3")
    })
})


describe('Event API get SingleDay', () => {
    // TEST 1: POST should create a new Event
    it('no events that day', async () => {
        const res = await request(app).get('/api/events/singleDay')
            .query({ dateString: "2025-07-13" })

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(0)
    })

    it('other days events not fetched', async () => {
        await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y1",
            date: "2025-07-13",
            startTime: 540,
        });
        await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y2",
            date: "2025-07-14",
            startTime: 540,
        });
        await request(app).post('/api/events').send({
            shortcode: "DKu7HQNhq3y3",
            date: "2025-07-15",
            startTime: 540,
        });
        const res = await request(app).get('/api/events/singleDay')
            .query({ dateString: "2025-07-14" })

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(1)
    })
})

describe('Event API get next7days', () => {
    // TEST 1: POST should create a new Event
    it('less that 7 events in 30 days fetches all', async () => {
        await Event.create([
            {
                shortcode: "DKu7HQNhq3y2024",
                date: "2024-01-02",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y21",
                date: "2024-01-02",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y2",
                date: "2025-01-02",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y3",
                date: "2025-01-03",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y4",
                date: "2025-01-04",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y5",
                date: "2025-01-05",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y6",
                date: "2025-01-06",
                startTime: 540,
            },
        ]);
        const res = await request(app).get('/api/events/next7days')
            .query({ dateString: "2025-01-01" })
        expect(res.statusCode).toBe(200)
        const events = res.body.events
        expect(Object.keys(events).length).toBe(5)
    })

    it('fetches only maxResults', async () => {
        await Event.create([
            {
                shortcode: "DKu7HQNhq3y2024",
                date: "2024-12-30",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y21",
                date: "2025-12-29",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y2",
                date: "2025-01-02",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y3",
                date: "2025-01-03",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y4",
                date: "2025-01-04",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y5",
                date: "2025-01-05",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y6",
                date: "2025-01-06",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y7",
                date: "2025-01-07",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y8",
                date: "2025-01-08",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y9",
                date: "2025-01-09",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y10",
                date: "2025-01-10",
                startTime: 540,
            },
        ]);
        const res = await request(app).get('/api/events/next7days')
            .query({ dateString: "2025-01-01" })
        expect(res.statusCode).toBe(200)
        const events = res.body.events
        expect(Object.keys(events).length).toBe(7)
        const firstKey = Object.keys(events)[0];
        expect(events[firstKey][0].shortcode).toBe("DKu7HQNhq3y2")
        const lastKey = Object.keys(events).at(-1);
        expect(events[lastKey][0].shortcode).toBe("DKu7HQNhq3y8")
        const shortcodes = Object.values(events)
            .flat()
            .map(event => event.shortcode);

        expect(shortcodes).toContain("DKu7HQNhq3y8");   
        expect(shortcodes).not.toContain("DKu7HQNhq3y9");
    })

    it('checks 30 days', async () => {
        await Event.create([
            {
                shortcode: "DKu7HQNhq3y2024",
                date: "2024-12-30",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y21",
                date: "2025-12-29",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y2",
                date: "2025-01-02",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y3",
                date: "2025-01-03",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y30",
                date: "2025-01-30",
                startTime: 540,
            },
            {
                shortcode: "DKu7HQNhq3y31",
                date: "2025-01-31",
                startTime: 540,
            },
        ]);
        const res = await request(app).get('/api/events/next7days')
            .query({ dateString: "2025-01-01" })
        expect(res.statusCode).toBe(200)
        const events = res.body.events
        expect(Object.keys(events).length).toBe(3)
        const firstKey = Object.keys(events)[0];
        expect(events[firstKey][0].shortcode).toBe("DKu7HQNhq3y2")
        const lastKey = Object.keys(events).at(-1);
        expect(events[lastKey][0].shortcode).toBe("DKu7HQNhq3y30")
        const shortcodes = Object.values(events)
            .flat()
            .map(event => event.shortcode);

        expect(shortcodes).toContain("DKu7HQNhq3y30");   
        expect(shortcodes).not.toContain("DKu7HQNhq3y31");
    })


})