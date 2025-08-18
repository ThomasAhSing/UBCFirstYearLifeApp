// Note tests are outdated

// Required libraries
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Post = require('../models/Post');

let mongoServer
const LIMIT = 10;

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
    await Post.deleteMany()
})

describe('Event API post', () => {
    // TEST 1: POST should create a new Post
    it('should create a new post', async () => {
        let res = await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-10T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img1.jpg",
                "pictures/jason_post1_img2.jpg",
                "pictures/jason_post1_img3.jpg",
                "pictures/jason_post1_img4.jpg",
                "pictures/jason_post1_img5.jpg",
                "pictures/jason_post1_img6.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        expect(res.statusCode).toBe(201)
        res = await request(app).get('/api/posts')
        .query({ limit: LIMIT })
        const posts = res.body.posts
        expect(posts.length).toBe(1)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP")
        expect(posts[0].media[0]).toBe("pictures/jason_post1_img1.jpg")
        expect(posts[0].profile.profile_pic_url).toBe("pictures/jason_pfp.jpg")
    })

    it('should fail missing required field', async () => {
        let res = await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-10T21:07:19-07:00"),
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        expect(res.statusCode).toBe(400)
    })
})


describe('Event API get', () => {
    
    it('gets all posts most recent first: < 10', async () => {
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP1",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-11T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img1.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP2",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-12T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img2.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP3",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-13T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img3.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        let res = await request(app).get('/api/posts')
        .query({ limit: LIMIT })
        expect(res.statusCode).toBe(200)
        const posts = res.body.posts
        expect(posts.length).toBe(3)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP3")
        expect(posts[2].shortcode).toBe("DJfNAKABGjP1")

    })

    it('get limit posts custom limit', async () => {
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP1",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-11T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img1.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP2",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-12T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img2.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP3",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-13T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img3.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP4",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-14T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img2.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP5",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-15T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img5.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP6",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-16T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img6.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        let res = await request(app).get('/api/posts')
        .query({ limit: 5 })
        expect(res.statusCode).toBe(200)
        const posts = res.body.posts
        expect(posts.length).toBe(5)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP6")
        expect(posts[4].shortcode).toBe("DJfNAKABGjP2")
    })

    it('load more, with custom beforeISO', async () => {
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP1",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-11T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img1.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP2",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-12T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img2.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP3",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-13T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img3.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP4",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-14T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img4.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP5",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-15T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img5.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP6",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-16T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img6.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP7",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-17T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img7.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        await request(app).post('/api/posts').send({
            shortcode: "DJfNAKABGjP8",
            userFetchedFrom: "jasontheween",
            caption: "21 years",
            likes: 148370,
            timestamp: new Date("2025-05-18T21:07:19-07:00"),
            media: [
                "pictures/jason_post1_img8.jpg",
            ],
            profile: {
                biography: "streamer @fazeclan \njason@unitedtalent.com",
                profile_pic_url: "pictures/jason_pfp.jpg"
            },
        });
        let res = await request(app).get('/api/posts')
        .query({ limit: 3 })
        expect(res.statusCode).toBe(200)
        let posts = res.body.posts
        expect(posts.length).toBe(3)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP8")
        expect(posts[2].shortcode).toBe("DJfNAKABGjP6")
        let beforeISO = new Date("2025-05-16T21:07:19-07:00").toISOString();
        res = await request(app).get('/api/posts')
        .query({ limit: 3, before: beforeISO })
        posts = res.body.posts
        expect(posts.length).toBe(3)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP5")
        expect(posts[2].shortcode).toBe("DJfNAKABGjP3")
        beforeISO = new Date("2025-05-13T21:07:19-07:00").toISOString();
        res = await request(app).get('/api/posts')
        .query({ limit: 3, before: beforeISO })
        posts = res.body.posts
        expect(posts.length).toBe(2)
        expect(posts[0].shortcode).toBe("DJfNAKABGjP2")
        expect(posts[1].shortcode).toBe("DJfNAKABGjP1")
    })
})
