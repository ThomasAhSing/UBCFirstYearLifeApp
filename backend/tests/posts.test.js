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
    // TEST 1: POST should create a new confession
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

    // // TEST 2: POST should fail with missing fields
    // it('should return 400 for missing fields', async () => {
    //     const res = await request(app).post('/api/confessions').send({
    //         residence: "TotemPark",
    //         // no content
    //     });

    //     expect(res.statusCode).toBe(400)
    //     expect(res.body.error).toBe("")
    // })
})
