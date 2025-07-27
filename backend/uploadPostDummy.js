const axios = require('axios');

async function uploadDummyPost() {
  const dummyPost = {
    shortcode: "dummy123",
    userFetchedFrom: "ubcdummy",
    caption: "This is a dummy post for testing",
    likes: 100,
    timestamp: new Date().toISOString(),
    media: [
        "https://firebasestorage.googleapis.com/v0/b/ubcfirstyearlifeapp.firebasestorage.app/o/test_upload%2Funrelated_image.jpg?alt=media&token=3b2673d0-fe9e-4181-b5fd-991c31fde402"    ],
    profile: {
        biography: "lakers 2026 championship",
        profile_pic_url: "https://firebasestorage.googleapis.com/v0/b/ubcfirstyearlifeapp.firebasestorage.app/o/test_upload%2Flebron.png?alt=media&token=cf6e5263-d3ea-4273-9c09-8ecd3276a4f6"
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


async function uploadDummyConfession() {
  const dummyConfession = {
    residence: "TotemPark",
    content: "Dummy TP",
  }

  try {
    const res = await axios
  }
}

// uploadDummyPost();

uploadDummyConfession();
