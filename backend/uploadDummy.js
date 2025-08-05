
const { DateTime } = require('luxon')
const axios = require('axios');

async function uploadDummyPost() {

  const timestampStr = "2025-07-09 19:16:07";

  const dt = DateTime.fromFormat(timestampStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const timestampMongo = dt.toJSDate();

  const dummyPost = {
    shortcode: "DL5f-NESZBp",
    userFetchedFrom: "ubcmmhc",
    caption: "Join us in volunteering to feed the homeless in downtown Vancouver. We hope to see you there!\n\nPlease feel free to reach out to with any questions. \n\nThe sign up form is in our linktree in bio.",
    likes: 10,
    timestamp: timestampMongo,
    media: [
      "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/ubcrec/DMYxyCEMNz4/000.jpg"
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

  const startAtStr = "2025-09-12 13:00:00";

  const dt = DateTime.fromFormat(startAtStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const startAtMongo = dt.toJSDate();

  const dummyEvent = {
    shortcode: "DL5f-NESZBp",
    title: "Volunteering at Guru Nanak's Free Kitchen",
    startAt: startAtMongo,
    location: "Downtown Eastside",
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

