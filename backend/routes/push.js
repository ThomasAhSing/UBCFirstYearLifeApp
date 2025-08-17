// routes/push.js
const express = require('express');
const { Expo } = require('expo-server-sdk');
const PushToken = require('../models/PushToken');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { token, subscribe = true, deviceId, platform } = req.body || {};
  if (!token || !Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'valid Expo token required' });
  }
  await PushToken.updateOne(
    { token },
    { $set: { token, subscribed: !!subscribe, deviceId, platform, updatedAt: new Date() } },
    { upsert: true }
  );
  res.sendStatus(204);
});

module.exports = router;
