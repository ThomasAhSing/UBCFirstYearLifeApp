
const { DateTime } = require('luxon')
const axios = require('axios');

async function uploadDummyPost() {

  const timestampStr = "2025-05-14 19:04:27";

  const dt = DateTime.fromFormat(timestampStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const timestampMongo = dt.toJSDate();

  const dummyPost = {
    shortcode: "DJpSH0oSmpr",
    userFetchedFrom: "officialubcfootball",
    caption: "OUR 2025 SCHEDULE IS OUT \u203c\ufe0f\ud83e\udd85\n\nMark your calendars. Bring the noise. We\u2019re ready. \ud83d\ude24\n\n#GoBirdsGo | #UBCF",
    likes: 335,
    timestamp: timestampMongo,
    media: [
      "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/officialubcfootball/DJpSH0oSmpr/000.jpg"
    ],
    profile: {
      biography: "",
      profile_pic_url: "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/default_profile_picture.jpg"
    },
    isEvent: true,
  };

  try {
    const res = await axios.post('http://localhost:10000/api/posts', dummyPost);
    console.log('✅ Upload success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Upload failed with response:', err.response.data);
    } else if (err.request) {
      console.error('❌ Upload failed, no response received. Check server is running.');
    } else {
      console.error('❌ Upload setup error:', err.message);
    }
  }
}


async function uploadDummyConfession(cIndx) {
  const dummyConfession = {
    residence: "OrchardCommons",
    content: "Dummy OC P2",
    submittedAt: new Date('2025-07-16T08:00:00-07:00'),
    posted: true,
    scheduledPostAt: new Date('2025-07-20T19:30:00-07:00'),
    postID: 2,
    confessionIndex: cIndx,
  }

  try {
    const res = await axios.post('http://localhost:10000/api/confessions', dummyConfession)
    console.log('✅ Confession upload success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Upload failed with response:', err.response.data);
    } else if (err.request) {
      console.error('❌ Upload failed, no response received. Check server is running.');
    } else {
      console.error('❌ Upload setup error:', err.message);
    }
  }
}


async function uploadDummyEvent() {

  const startAtStr = "2025-10-17 18:00:00";

  const dt = DateTime.fromFormat(startAtStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const startAtMongo = dt.toJSDate();

  const dummyEvent = {
    shortcode: "DJpSH0oSmpr",
    title: "UBC Tbirds Football Game vs Huskies",
    startAt: startAtMongo,
    location: "UBC Home Football Field",
  }

  try {
    const res = await axios.post('http://localhost:10000/api/events', dummyEvent)
    console.log('✅ Confession upload success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Upload failed with response:', err.response.data);
    } else if (err.request) {
      console.error('❌ Upload failed, no response received. Check server is running.');
    } else {
      console.error('❌ Upload setup error:', err.message);
    }
  }
}

// uploadDummyPost();

// uploadDummyConfession(1);
// uploadDummyConfession(2);
// uploadDummyConfession(3);

uploadDummyEvent();

