// routes/admin.js
const express = require('express');
const router = express.Router();

router.post('/check-passcode', (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.ADMIN_PASSCODE) {
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: 'Invalid passcode' });
  }
});

module.exports = router;
