
const { DateTime } = require('luxon')
const axios = require('axios');

async function uploadDummyPost() {

  const timestampStr = "2025-07-07 20:35:56";

  const dt = DateTime.fromFormat(timestampStr, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/Vancouver"
  });

  const timestampMongo = dt.toJSDate();

  const dummyPost = {
    shortcode: "DL0fhHBhkUN",
    userFetchedFrom: "ubcwsoccer",
    caption: "Preseason \ud83d\udd12\n\n2 trips to \ud83c\uddfa\ud83c\uddf8 and a match vs the USPORTS championship hosts!",
    likes: 454,
    timestamp: timestampMongo,
    media: [
      "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/ubcwsoccer/DL0fhHBhkUN/000.jpg"
    ],
    profile: {
      biography: "Official Instagram of UBC Women's Soccer\ud83c\udde8\ud83c\udde6\u26bd\ufe0f\n9x National Champions \ud83c\udfc6 Including 2024\n17x CanadaWest Champions \ud83c\udfc6 Including 2024",
      profile_pic_url: "https://storage.googleapis.com/ubcfirstyearlifeapp.firebasestorage.app/ubcwsoccer/profile-picture.jpg"
    },
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

uploadDummyPost();

// uploadDummyConfession(1);
// uploadDummyConfession(2);
// uploadDummyConfession(3);

