// utils/notify.js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushToAll(tokens, payload) {
  console.log('[push] start: tokens=%d', tokens.length);

  if (process.env.PUSH_DRY_RUN === 'true') {
    console.log('[PUSH_DRY_RUN]', { count: tokens.length, payload });
    return;
  }

  const validTokens = tokens.filter(Expo.isExpoPushToken);
  const invalidCount = tokens.length - validTokens.length;
  if (invalidCount) console.log('[push] skipped invalid tokens:', invalidCount);

  const messages = validTokens.map(to => ({
    to,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }));
  console.log('[push] messages to send:', messages.length);

  for (const chunk of expo.chunkPushNotifications(messages)) {
    console.log('[push] sending chunk size=', chunk.length);
    try {
      await expo.sendPushNotificationsAsync(chunk);
      console.log('[push] chunk sent ✓');
    } catch (e) {
      console.error('[push] chunk failed ✗', e);
    }
  }

  console.log('[push] done');
}

module.exports = { sendPushToAll };
