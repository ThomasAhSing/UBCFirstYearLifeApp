
const { DateTime } = require('luxon')
const axios = require('axios');

async function uploadDummyPost() {

  const timestampStr = "2025-07-21 22:48:12";

  const dt = DateTime.fromFormat(timestampStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const timestampMongo = dt.toJSDate();

  const dummyPost = {
    shortcode: "DMYxyCEMNz4",
    userFetchedFrom: "ubcrec",
    caption: "\ud83c\udfc0\u26bd UBC Rec is hiring Intramural Officials! \ud83c\udfd0\ud83c\udfd2\nLove sports? We're looking for officials for our upcoming intramural leagues!\n\n\ud83d\udcf2 Click the link in bio to see open positions and apply today!\n\n #ubc #ubcrec",
    likes: 87,
    timestamp: timestampMongo,
    media: [
      "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/ubcrec/DMYxyCEMNz4/000.jpg"
    ],
    profile: {
      biography: "Getting UBC moving through health, wellness, & recreational sport since 1967.\nWebsite \u2199\ufe0f",
      profile_pic_url: "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/ubcrec/profile-picture.jpg"
    },
    isEvent: false,
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

  const startAtStr = "2025-08-01 10:00:00";

  const dt = DateTime.fromFormat(startAtStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const startAtMongo = dt.toJSDate();

  const dummyEvent = {
    shortcode: "DM0lsyxtlRw",
    title: "UBC Rec Auguest Events / Activities",
    startAt: startAtMongo,
    location: "UBC",
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

uploadDummyPost();

// uploadDummyConfession(1);
// uploadDummyConfession(2);
// uploadDummyConfession(3);

// uploadDummyEvent();

