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

describe('Event API', () => {
    // TEST 1: 
})
