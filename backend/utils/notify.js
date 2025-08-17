// utils/notify.js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushToAll(tokens, payload) {
  const messages = tokens
    .filter(Expo.isExpoPushToken)
    .map(to => ({ to, sound: 'default', title: payload.title, body: payload.body, data: payload.data }));

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try { await expo.sendPushNotificationsAsync(chunk); }
    catch (e) { console.error('push chunk failed', e); }
  }
}
module.exports = { sendPushToAll };
