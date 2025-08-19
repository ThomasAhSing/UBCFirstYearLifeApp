const express = require('express');
const router = express.Router();

// GET /support
router.get('/', (req, res) => {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Support – First Year Life</title>
  <style>
    body { font-family: system-ui, sans-serif; background:#0C2A42; color:white; margin:0; padding:2rem; }
    .card { background:#173E63; padding:2rem; border-radius:12px; max-width:700px; margin:auto; }
    a { color:#47B1E9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>First Year Life – Support</h1>
    <p>If you need help, contact us at 
      <a href="mailto:firstyearlife.support@example.com">firstyearlife.support@example.com</a>.
    </p>
    <p>You can also submit feedback here: 
      <a href="https://forms.gle/your-google-form-id" target="_blank">Feedback Form</a>
    </p>
    <p><a href="/">Back to Home</a></p>
  </div>
</body>
</html>`;
  res.type('html').send(html);
});

// Optional: placeholders (so Apple won’t reject you)
router.get('/privacy', (req, res) => {
  res.type('html').send('<h1>Privacy Policy</h1><p>We respect your privacy. More details coming soon.</p>');
});

router.get('/terms', (req, res) => {
  res.type('html').send('<h1>Terms of Use</h1><p>Basic placeholder terms. Replace with full version later.</p>');
});

module.exports = router;
