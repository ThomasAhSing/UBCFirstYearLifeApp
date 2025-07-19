// Required libraries
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Confession = require('../models/Confession');

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
    await Confession.deleteMany() 
})

describe('Event API', () => {
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

    // TEST Ppost-batch 1: 
    it('should correctly move unposted confession to posted for each residence', async () => {
        await Confession.create([
              
        ])
    })

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
        .query({ residence: 'TotemPark'})

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(3);
    })
})
