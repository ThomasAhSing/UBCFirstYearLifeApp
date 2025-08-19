const express = require('express');
const router = express.Router();

function page() {
  const today = new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Support – First Year Life</title>
<meta name="description" content="Support for First Year Life. Contact for help, collaborations, bug reports, or feature requests.">
<style>
:root{--bg:#0C2A42;--card:#173E63;--text:#e9f1f7;--muted:#b9c7d3;--accent:#47B1E9}
html,body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:900px;margin:48px auto;padding:0 20px}
.card{background:var(--card);border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.25)}
a{color:var(--accent)} h1{margin:0 0 10px}
.pill{display:inline-block;border:1px solid #1e4766;color:var(--muted);padding:6px 10px;border-radius:999px;font-size:12px}
</style>
</head>
<body>
  <div class="wrap"><div class="card">
    <h1>First Year Life — Support</h1>
    <span class="pill">Last updated: ${today}</span>
    <p>For collaborations, help, bug reports, or feature requests, email us at:</p>
    <p><a href="mailto:ahsingthomas@gmail.com">ahsingthomas@gmail.com</a></p>
    <p>Policies: <a href="/privacy">Privacy Policy</a> • <a href="/terms">Terms of Use</a></p>
  </div></div>
</body>
</html>`;
}

router.get('/', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.type('html').send(page());
});

module.exports = router;
 