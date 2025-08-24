// utils/signing.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function signCode(payload) {
  // contains at least { email, rid }
  return jwt.sign(payload, SECRET);
}

function verifyCode(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signCode, verifyCode };
