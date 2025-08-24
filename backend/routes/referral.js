// routes/referral.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { customAlphabet } = require('nanoid');
const crypto = require('crypto');

const Referrer = require('../models/Referrer');
const ClickCredit = require('../models/ClickCredit');
const EventLog = require('../models/EventLog'); // optional; keep if you created it
const { signCode, verifyCode } = require('../utils/signing');

const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 8);
const router = express.Router();

// --- rate limits ---
const registerLimiter = rateLimit({ windowMs: 60_000, max: 10 });

// --- helpers ---
function normalizeEmail(e = '') { return String(e).trim().toLowerCase(); }
function isEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

/**
 * POST /referral/register
 * Body: { email }
 * Returns: { code, shareUrl, entries }
 * Behavior: new user starts with entries = 1 (signup bonus). Existing user returns current values.
 */
router.post('/referral/register', registerLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isEmail(email)) return res.status(400).json({ error: 'invalid_email' });

    let ref = await Referrer.findOne({ email });
    if (ref) {
      return res.json({
        code: ref.code,
        shareUrl: ref.shareUrl,
        entries: ref.entries,
      });
    }

    // create signed token and share URL
    const rid = nanoid();
    const token = signCode({ email, rid });

    // allow either env var name (so you can use EXPO_PUBLIC_API_BASE_URL on Render)
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.error('Missing PUBLIC_BASE_URL/EXPO_PUBLIC_API_BASE_URL');
      return res.status(500).json({ error: 'server_misconfig' });
    }
    const shareUrl = `${baseUrl}/r/${encodeURIComponent(token)}`;

    // +1 for registering
    ref = await Referrer.create({ email, code: token, shareUrl, entries: 1 });

    return res.status(201).json({
      code: ref.code,
      shareUrl: ref.shareUrl,
      entries: ref.entries,
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

/**
 * GET /r/:token
 * Behavior: log a click, award +1 entry once per (code, ip|ua, day), redirect to App Store.
 */
router.get('/r/:token', async (req, res) => {
  const token = req.params.token;

  // derive a stable-ish client fingerprint (proxy-safe IP + UA)
  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || req.ip || '0.0.0.0';
  const ua = req.headers['user-agent'] || '';
  const day = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' UTC
  const ipHash = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex');

  try {
    const payload = verifyCode(token); // throws if invalid

    // log raw click (optional)
    try { await EventLog.create({ code: token, type: 'click', ip, ua }); } catch {}

    // try to award +1 once per day per device for this code
    try {
      await ClickCredit.create({
        code: token,
        referrerEmail: payload.email,
        day,
        ipHash,
      });

      const ref = await Referrer.findOne({ email: payload.email });
      if (ref) {
        ref.entries += 1;
        await ref.save();
        try { await EventLog.create({ code: token, type: 'click_credited', ip, ua }); } catch {}
      }
    } catch (dup) {
      // duplicate for this (code, ipHash, day) → ignore
    }
  } catch (err) {
    // invalid token → ignore but continue redirect for good UX
  }

  // always redirect to your App Store page
  const appStore = process.env.APP_STORE_URL;
  if (!appStore) {
    console.error('Missing APP_STORE_URL');
    return res.status(500).send('App not configured');
  }
  return res.redirect(302, appStore);
});

module.exports = router;
