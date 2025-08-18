// Note tests are outdated

// Required libraries
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Confession = require('../models/Confession');

let mongoServer

const BATCH_SIZE = 6
const MAX_DAYS = 5
const NUM_CONFESSIONS_PER_POST = 3
const RESIDENCES = ['TotemPark', 'OrchardCommons', 'PlaceVanier']

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    // jest.useFakeTimers({ now: new Date('2025-02-06T12:00:00-07:00'), legacy: false });
})

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Stop the in-memory server
    await mongoServer.stop();
    // jest.useRealTimers(); // Restore real time after all tests
})

// clear all events in the database
afterEach(async () => {
    await Confession.deleteMany()
})

describe('Confesison API', () => {

    it('each field assigned correctly unposted', async () => {
        await request(app).post('/api/confessions').send({
            residence: "TotemPark",
            content: "Totem Park test confession"
        });
        const res = await request(app).get('/api/confessions/unposted')
        .query({ residence: 'TotemPark' })
        const confession = res.body[0]
        expect(confession.residence).toBe('TotemPark')
        expect(confession.content).toBe('Totem Park test confession')
        expect(confession.posted).toBe(false)
        const today = new Date()
        const todayDay = today.getDate()
        const submittedAt = new Date(confession.submittedAt)
        expect(submittedAt.getDate()).toBe(todayDay)
        expect(confession.scheduledPostAt).toBe(undefined)
        expect(confession.postID).toBe(undefined)
        expect(confession.confessionIndex).toBe(undefined)
    })

    it('each field assigned correctly staged', async () => {
        await request(app).post('/api/confessions').send({
            residence: "TotemPark",
            content: "Totem Park test confession"
        });
        const res = await request(app).get('/api/confessions/unposted')
        .query({ residence: 'TotemPark' })
        const confession = res.body[0]
        expect(confession.residence).toBe('TotemPark')
        expect(confession.content).toBe('Totem Park test confession')
        expect(confession.posted).toBe(false)
        const today = new Date()
        const todayDay = today.getDate()
        const submittedAt = new Date(confession.submittedAt)
        expect(submittedAt.getDate()).toBe(todayDay)
        expect(confession.scheduledPostAt).toBe(undefined)
        expect(confession.postID).toBe(undefined)
        expect(confession.confessionIndex).toBe(undefined)
    })

    // TEST POST 1: POST should create a new confession
    it('should create a new confession', async () => {
        const res = await request(app).post('/api/confessions').send({
            residence: "TotemPark",
            content: "Totem Park Sample Confession 1"
        });

        expect(res.statusCode).toBe(201); // 201 = successfully created 
        expect(res.body.confession.residence).toBe("TotemPark");
        expect(res.body.confession.content).toBe("Totem Park Sample Confession 1");

        const inDb = await Confession.findOne({ content: "Totem Park Sample Confession 1" });
        expect(inDb).not.toBeNull(); // The book should exist in the DB
    })

    // TEST POST 2: POST should fail with missing fields
    it('should return 400 for missing fields', async () => {
        const res = await request(app).post('/api/confessions').send({
            residence: "TotemPark",
            // no content
        });

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe("All fields are required")
    })

    //////////////////// GET TESTS ///////////////////////////

    // TEST GET 1: Get all confessions for specific residence
    it('should get all confessions for residence', async () => {
        await Confession.create([
            {
                residence: "TotemPark",
                content: "TP P1 C1",
                submittedAt: new Date('2025-07-17T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-18T19:30:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C2",
                submittedAt: new Date('2025-07-17T09:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-18T19:30:00-07:00'),
                postID: 1,
                confessionIndex: 2,
            },
            {
                residence: "TotemPark",
                content: "TP P2 C1",
                submittedAt: new Date('2025-07-17T10:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-18T19:30:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {   // should not be included in GET
                residence: "TotemPark",
                content: "sample content",
                submittedAt: new Date('2025-07-17T10:00:00-07:00'),
                posted: false,
            },
            {   // should not be included in GET
                residence: "PlaceVanier",
                content: "PV Confession 1",
                submittedAt: new Date('2025-07-17T07:00:00-07:00'),
                posted: true,
                // later scheduled, but should not be picked since residence not same
                scheduledPostAt: new Date('2025-07-18T20:30:00-07:00'),
                postID: 1,
                confessionIndex: 2,
            },
        ]);
        const res = await request(app).get('/api/confessions')
            .query({ residence: 'TotemPark' })

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[0].posted).toBe(true)
    })

    it('doenst fetch staged', async () => {
        await Confession.create([
            {
                residence: "TotemPark",
                content: "TP P1 C1",
                submittedAt: new Date('2025-07-17T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-18T19:30:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C2",
                submittedAt: new Date('2025-07-17T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-18T19:30:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P2 C1",
                submittedAt: new Date('2025-07-19T08:00:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P2 C2",
                submittedAt: new Date('2025-07-19T08:00:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 2,
            },
            {
                residence: "TotemPark",
                content: "TP P3 C1",
                submittedAt: new Date('2025-07-20T08:00:00-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P3 C2",
                submittedAt: new Date('2025-07-20T08:01:00-07:00'),
                posted: false,
            },
        ]);
        const res = await request(app).get('/api/confessions')
            .query({ residence: 'TotemPark' })

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    })

    //////////////////// POST-BATCH TESTS ///////////////////////////

    it('first confession - INF days since last post', async () => {
        await Confession.create([
            {
                residence: "TotemPark",
                content: "TP P1 C1",
                submittedAt: new Date('2025-01-01T08:00:00-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C2",
                submittedAt: new Date('2025-01-01T08:00:01-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C3",
                submittedAt: new Date('2025-01-01T08:00:02-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C4",
                submittedAt: new Date('2025-01-01T08:00:05-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C5",
                submittedAt: new Date('2025-01-01T08:00:04-07:00'),
                posted: false,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C6",
                submittedAt: new Date('2025-01-01T08:00:05-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P1 C1",
                submittedAt: new Date('2025-01-01T08:00:00-07:00'),
                posted: false,
            },
            {
                residence: "PlaceVanier",
                content: "PV P1 C1",
                submittedAt: new Date('2025-01-01T08:00:00-07:00'),
                posted: false,
            },
        ]);


        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })

        expect(res.statusCode).toBe(200);
        const err = res
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'TotemPark' })
        const confessions = res.body;
        expect(confessions.length).toBe(6);
        expect(confessions[0].postID).toBe(2);
        expect(confessions[0].confessionIndex).toBe(3);
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'PlaceVanier' })
        expect(res.body.length).toBe(0)

    })

    it('5 day gap - no prev staged = new PostID', async () => {
        await Confession.create([
            {
                residence: "PlaceVanier",
                content: "PV P1 C1",
                submittedAt: new Date('2025-01-01T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-01-01T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "PV P2 C1",
                submittedAt: new Date('2025-01-29T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-02-01T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "PV P2 C2",
                submittedAt: new Date('2025-01-29T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-02-01T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 2,
            },
            {
                // to see if another residence with higher postID throws off
                residence: "OrchardCommons",
                content: "PV P4 C1",
                submittedAt: new Date('2025-01-29T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-02-01T20:00:00-07:00'),
                postID: 4,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "PV P3 C1",
                submittedAt: new Date('2025-02-02T08:00:00-07:00'),
                posted: false,
            },
            {
                residence: "PlaceVanier",
                content: "PV P3 C2",
                submittedAt: new Date('2025-02-02T08:01:00-07:00'),
                posted: false,
            },
        ]);

        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'PlaceVanier' })
        const confessions = res.body;
        expect(confessions.length).toBe(2)
        expect(confessions[0].postID).toBe(3)
        expect(confessions[0].confessionIndex).toBe(2)
        expect(confessions[0].content).toBe("PV P3 C2")
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'PlaceVanier' })
        expect(res.body.length).toBe(0)
    });

    // it('5 day gap - prev staged exists = check if use last PostID',
    it('5 day gap - prev staged exists = check if use last PostID', async () => {
        await Confession.create([
            {
                residence: "PlaceVanier",
                content: "PV P1 C1",
                submittedAt: new Date('2025-01-01T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-01-01T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },{
                residence: "PlaceVanier",
                content: "PV P2 C1",
                submittedAt: new Date('2025-01-02T08:00:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-02-01T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "PV P2 C2",
                submittedAt: new Date('2025-02-02T08:00:00-07:00'),
                posted: false,
            },
            {
                residence: "PlaceVanier",
                content: "PV P2 C3",
                submittedAt: new Date('2025-02-02T08:01:00-07:00'),
                posted: false,
            },


        ]);

        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'PlaceVanier' })
        const confessions = res.body;
        expect(confessions.length).toBe(3)
        expect(confessions[0].postID).toBe(2)
        expect(confessions[0].confessionIndex).toBe(3)
        expect(confessions[0].content).toBe("PV P2 C3")
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'PlaceVanier' })
        expect(res.body.length).toBe(0)
        
    });

    it('BATCH_SIZE not reached from 0 staged', async () => {
        await Confession.create([
            {
                residence: "OrchardCommons",
                content: "OC P1 C1",
                // !!! This scheduled date needs to be less than 5 days from now
                submittedAt: new Date('2025-07-18T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-02-02T08:01:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-02-02T08:02:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-02-02T08:03:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-02-02T08:04:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-02-02T08:05:00-07:00'),
                posted: false,
            },

        ]);

        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'OrchardCommons' })
        const confessions = res.body;
        expect(confessions.length).toBe(0)
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'OrchardCommons' })
        expect(res.body.length).toBe(5)
        
    });

    it('BATCH_SIZE reached from 0 staged', async () => {
        await Confession.create([
            {
                residence: "OrchardCommons",
                content: "OC P1 C1",
                // !!! This scheduled date needs to be less than 5 days from now
                submittedAt: new Date('2025-07-18T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C2",
                submittedAt: new Date('2025-07-19T08:02:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C3",
                submittedAt: new Date('2025-07-19T08:03:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C1",
                submittedAt: new Date('2025-07-19T08:04:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C2",
                submittedAt: new Date('2025-07-19T08:05:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C3",
                submittedAt: new Date('2025-07-19T08:06:00-07:00'),
                posted: false,
            },
        ]);

        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'OrchardCommons' })
        const confessions = res.body;
        expect(confessions.length).toBe(6)
        expect(confessions[0].postID).toBe(3)
        expect(confessions[0].confessionIndex).toBe(3)
        expect(confessions[0].content).toBe("OC P3 C3")
        expect(confessions.length).toBe(6)
        expect(confessions[2].postID).toBe(3)
        expect(confessions[2].confessionIndex).toBe(1)
        expect(confessions[2].content).toBe("OC P3 C1")
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'OrchardCommons' })
        expect(res.body.length).toBe(0)
        
    });

    it('BATCH_SIZE reached from some already staged', async () => {
        await Confession.create([
            {
                residence: "OrchardCommons",
                content: "OC P1 C1",
                // !!! This scheduled date needs to be less than 5 days from now
                submittedAt: new Date('2025-07-18T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C2",
                submittedAt: new Date('2025-07-19T08:02:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 2,
            },
            {
                residence: "OrchardCommons",
                content: "OC P2 C3",
                submittedAt: new Date('2025-07-19T08:03:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C1",
                submittedAt: new Date('2025-07-19T08:04:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C2",
                submittedAt: new Date('2025-07-19T08:05:00-07:00'),
                posted: false,
            },
            {
                residence: "OrchardCommons",
                content: "OC P3 C3",
                submittedAt: new Date('2025-07-19T08:06:00-07:00'),
                posted: false,
            },
        ]);

        let res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'OrchardCommons' })
        const confessions = res.body;
        expect(confessions.length).toBe(6)
        expect(confessions[0].postID).toBe(3)
        expect(confessions[0].confessionIndex).toBe(3)
        expect(confessions[0].content).toBe("OC P3 C3")
        expect(confessions.length).toBe(6)
        expect(confessions[2].postID).toBe(3)
        expect(confessions[2].confessionIndex).toBe(1)
        expect(confessions[2].content).toBe("OC P3 C1")
        res = await request(app).get('/api/confessions/unposted')
            .query({ residence: 'OrchardCommons' })
        expect(res.body.length).toBe(0)
    });


    /////////// POST-STAGED //////////////////
    it('move staged to posted', async () => {
        await Confession.create([
            {
                residence: "TotemPark",
                content: "TP P1 C1",
                submittedAt: new Date('2025-07-17T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-17T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P1 C2",
                submittedAt: new Date('2025-07-17T08:01:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-17T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 2,
            },
            // staged that should be made true
            {
                residence: "TotemPark",
                content: "TP P2 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P2 C2",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 2,
            },
            // staged that should NOT be made true
            // chage dates to have future scheduledPostAt
            {
                residence: "TotemPark",
                content: "TP P3 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2026-07-19T20:00:00-07:00'),
                postID: 3,
                confessionIndex: 1,
            },
            {
                residence: "TotemPark",
                content: "TP P3 C2",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2026-07-19T20:00:00-07:00'),
                postID: 3,
                confessionIndex: 2,
            },
            {
                residence: "PlaceVanier",
                content: "VP P1 C1",
                submittedAt: new Date('2025-07-17T08:00:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-17T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "VP P1 C2",
                submittedAt: new Date('2025-07-17T08:01:00-07:00'),
                posted: true,
                scheduledPostAt: new Date('2025-07-17T20:00:00-07:00'),
                postID: 1,
                confessionIndex: 2,
            },
            // staged that should be made true
            {
                residence: "PlaceVanier",
                content: "VP P2 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "VP P2 C2",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2025-07-19T20:00:00-07:00'),
                postID: 2,
                confessionIndex: 2,
            },
            // staged that should NOT be made true
            // chage dates to have future scheduledPostAt
            {
                residence: "PlaceVanier",
                content: "VP P3 C1",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2026-07-19T20:00:00-07:00'),
                postID: 3,
                confessionIndex: 1,
            },
            {
                residence: "PlaceVanier",
                content: "VP P3 C2",
                submittedAt: new Date('2025-07-19T08:01:00-07:00'),
                posted: false,
                scheduledPostAt: new Date('2026-07-19T20:00:00-07:00'),
                postID: 3,
                confessionIndex: 2,
            },
        ]);
            
        let res = await request(app).post('/api/confessions/post-staged');
        expect(res.statusCode).toBe(200);
        res = await request(app).post('/api/confessions/post-batch')
            .send({
                BATCH_SIZE: BATCH_SIZE,
                MAX_DAYS: MAX_DAYS,
                NUM_CONFESSIONS_PER_POST: NUM_CONFESSIONS_PER_POST,
                RESIDENCES: RESIDENCES,
            })
        expect(res.statusCode).toBe(200);
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'TotemPark' })
        let confessions = res.body;
        expect(confessions.length).toBe(2)
        expect(confessions[0].postID).toBe(3)
        expect(confessions[0].confessionIndex).toBe(2)
        expect(confessions[0].content).toBe("TP P3 C2")

        res = await request(app).get('/api/confessions')
            .query({ residence: 'TotemPark' })
        confessions = res.body;
        expect(res.body.length).toBe(4)
        expect(confessions[0].postID).toBe(1)
        expect(confessions[0].confessionIndex).toBe(1)
        expect(confessions[0].content).toBe("TP P1 C1")
        expect(confessions[confessions.length -1].postID).toBe(2)
        expect(confessions[confessions.length -1].confessionIndex).toBe(2)
        expect(confessions[confessions.length -1].content).toBe("TP P2 C2")
        

        // check vanier also maek stage true
        res = await request(app).get('/api/confessions/staged')
            .query({ residence: 'PlaceVanier' })
        confessions = res.body;
        expect(confessions.length).toBe(2)
        expect(confessions[0].postID).toBe(3)
        expect(confessions[0].confessionIndex).toBe(2)
        expect(confessions[0].content).toBe("VP P3 C2")

        res = await request(app).get('/api/confessions')
            .query({ residence: 'PlaceVanier' })
        confessions = res.body;
        expect(res.body.length).toBe(4)
        expect(confessions[0].postID).toBe(1)
        expect(confessions[0].confessionIndex).toBe(1)
        expect(confessions[0].content).toBe("VP P1 C1")
        expect(confessions[confessions.length -1].postID).toBe(2)
        expect(confessions[confessions.length -1].confessionIndex).toBe(2)
        expect(confessions[confessions.length -1].content).toBe("VP P2 C2")
    });
    
})
