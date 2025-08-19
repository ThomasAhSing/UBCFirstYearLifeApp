const express = require('express');
const router = express.Router();

function page() {
  const today = new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Terms of Use – First Year Life</title>
<meta name="description" content="Terms of Use for First Year Life.">
<style>
:root{--bg:#0C2A42;--card:#173E63;--text:#e9f1f7;--muted:#b9c7d3;--accent:#47B1E9}
html,body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:900px;margin:48px auto;padding:0 20px}
.card{background:var(--card);border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.25)}
a{color:var(--accent)} h1{margin:0 0 10px}
ul{padding-left:18px}
.pill{display:inline-block;border:1px solid #1e4766;color:var(--muted);padding:6px 10px;border-radius:999px;font-size:12px}
.notice{color:#ffdf99}
</style>
</head>
<body>
  <div class="wrap"><div class="card">
    <h1>First Year Life - Terms of Use</h1>
    <span class="pill">Last updated: ${today}</span>

    <h2>Community Rules</h2>
    <ul>
      <li><strong>Anonymous confessions may include disrespectful or mean comments, including swear words.</strong> This is part of the app’s design and is permitted.</li>
      <li><strong>Not allowed:</strong> complete hate speech, anti-Semitism, targeted harassment of protected groups, or excessive use of racial slurs. Posts crossing this line may be removed.</li>
      <li>Only post content you have the right to share.</li>
      <li>Use the app lawfully and responsibly.</li>
    </ul>

    <h2>Content & Liability</h2>
    <ul>
      <li>User-generated confessions are the responsibility of the user who posted them.</li>
      <li>The service is provided “as is” without warranties.</li>
      <li>We may remove or decline to publish confessions that break these rules.</li>
      <li>We may modify or discontinue features at any time.</li>
    </ul>

    <h2>Changes</h2>
    <p>We may update these Terms and the Privacy Policy. Continued use after changes means you accept the updated terms.</p>

    <h2>Contact</h2>
    <p>Email: <a href="mailto:ahsingthomas@gmail.com">ahsingthomas@gmail.com</a></p>

    <p><a href="/support">Back to Support</a> • <a href="/privacy">Privacy Policy</a></p>
  </div></div>
</body>
</html>`;
}

router.get('/', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.type('html').send(page());
});

module.exports = router;
