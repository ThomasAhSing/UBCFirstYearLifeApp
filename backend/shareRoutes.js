const express = require('express');
const router = express.Router();

const APP_SCHEME = (process.env.APP_SCHEME || 'ubcfirstyearlifeapp') + '://';
const WEB_BASE   = (process.env.WEB_BASE || 'https://ubcfirstyearlifeapp.onrender.com').replace(/\/+$/, '');

function page({ title, desc, deep, web }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${web}">
<meta name="twitter:card" content="summary">
<style>
  body{margin:0;background:#0a1a2b;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .wrap{max-width:720px;margin:0 auto;padding:24px}
  .card{background:#10253b;border:1px solid #173E63;border-radius:16px;padding:20px}
  .title{font-size:32px;font-weight:800;margin:0 0 8px}
  .desc{opacity:.9;margin:0 0 16px}
  .row{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
  a.btn{color:#bcd7f4;text-decoration:none;padding:12px 16px;border:1px solid #2c69a5;border-radius:12px}
  a.primary{background:#2c69a5;color:#fff}
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1 class="title">${title}</h1>
      <p class="desc">${desc}</p>
      <div class="row">
        <a class="btn primary" id="openApp" href="${deep}">Open in the app</a>
        <a class="btn" href="${web}">View on web</a>
      </div>
    </div>
  </div>

<script>
  (function(){
    var deep='${deep}';
    var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var isAndroid = /Android/i.test(navigator.userAgent);

    // open on user tap (works on both iOS & Android)
    document.getElementById('openApp').addEventListener('click', function(e){
      // keep the href for browsers that allow it; also set via JS for consistency
      e.preventDefault();
      window.location.href = deep;

      // Android: if app not installed, go to Play after a short delay
      if (isAndroid) {
        setTimeout(function(){
          // TODO: replace with your real Play Store URL
          window.location.href = 'https://play.google.com/store/apps/details?id=YOUR.PACKAGE';
        }, 1000);
      }
    });

    // Auto-open ONLY on Android (iOS often blanks the page if done automatically)
    if (isAndroid) {
      setTimeout(function(){
        document.getElementById('openApp').click();
      }, 0);
    }
  })();
</script>
</body>
</html>`;
}


router.get('/p/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const ci = Number(req.query.ci) || 0;
  const deep = `${APP_SCHEME}post/${encodeURIComponent(shortcode)}${ci>=0?`?ci=${ci}`:''}`;
  const web  = `${WEB_BASE}/p/${encodeURIComponent(shortcode)}${ci>=0?`?ci=${ci}`:''}`;
  res.type('html').send(page({ title: 'Shared post', desc: 'Open this post in UBC First Year Life', deep, web }));
});

router.get('/cg/:residence/:postId', (req, res) => {
  const { residence, postId } = req.params;
  const ci = Number(req.query.ci) || 0;
  const deep = `${APP_SCHEME}cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${ci>=0?`?ci=${ci}`:''}`;
  const web  = `${WEB_BASE}/cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${ci>=0?`?ci=${ci}`:''}`;
  res.type('html').send(page({ title: 'Shared confession', desc: 'Open this confession in UBC First Year Life', deep, web }));
});

module.exports = router;
