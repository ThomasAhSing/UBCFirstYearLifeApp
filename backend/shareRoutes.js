// shareRoutes.js
const express = require('express');
const router = express.Router();

const APP_SCHEME = (process.env.APP_SCHEME || 'ubcfirstyearlifeapp') + '://';
const WEB_BASE   = (process.env.WEB_BASE || 'https://ubcfirstyearlifeapp.onrender.com').replace(/\/+$/,'');
const APPSTORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';         // TODO
const PLAY_URL     = 'https://play.google.com/store/apps/details?id=YOUR.PACKAGE'; // TODO

// ---------- helpers ----------
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trim = (s='', n=200) => { const t=String(s).replace(/\s+/g,' ').trim(); return t.length>n?t.slice(0,n-1)+'…':t; };
const qci  = (ci) => (Number.isFinite(ci) ? `?ci=${ci}` : '');
const dots = (len=0, active=0) =>
  Array.from({length: Math.max(0,len)}, (_,i)=> `<span class="dot ${i===active?'active':''}"></span>`).join('');

// ---------- CSS ----------
const CSS = `
:root{
  --bg:#0a1a2b;         /* page background (navy)         */
  --card:#10253b;       /* main card (darker navy)        */
  --border:#173E63;     /* thin navy border               */
  --teal:#c8efe8;       /* light teal background          */
  --tealTop:#0f8a7c;    /* teal header strip              */
  --paper:#ffffff;      /* confession card                */
  --text:#0b1a2a;       /* dark text on white             */
  --muted:#3c586f;      /* subtle grey-blue               */
  --muted2:#bcd7f4;     /* light blue text                */
  --gold:#F5D054;       /* active dot                     */
  --goldDim:#A77F2E;    /* inactive dot                   */
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:#fff;font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial}
.wrap{max-width:860px;margin:0 auto;padding:28px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.title{font-weight:800;font-size:32px;margin:0 0 6px}
.desc{opacity:.92;margin:0 0 16px}
.confShell{
  background:var(--teal);
  border-radius:16px;
  padding:12px;
  color:#0b1a2a;
}
.confHeader{
  background:linear-gradient(180deg,var(--tealTop) 0 10px, transparent 0), var(--teal);
  border:1px solid rgba(0,0,0,0.08);
  border-radius:12px;
  padding:12px 14px 10px 14px;
  color:#0b1a2a;
  box-shadow:0 2px 0 rgba(0,0,0,.05) inset;
}
.confHeader h2{margin:0 0 6px;font-size:18px;font-weight:800}
.confHeader p{margin:0 0 4px;font-size:14px}
.confHeader .fine{font-style:italic;opacity:.8}
.confBody{
  margin-top:10px;
  background:var(--paper);
  color:var(--text);
  border-radius:12px;
  padding:14px;
  min-height:120px;
  box-shadow:0 1px 0 rgba(0,0,0,.05) inset;
  white-space:pre-wrap;
}
.timestamp{font-size:12px; color:var(--muted); text-align:right; margin-top:6px}
.dotsRow{display:flex;gap:6px;justify-content:center;margin:14px 0 0}
.dot{width:6px;height:6px;border-radius:999px;background:var(--goldDim)}
.dot.active{background:var(--gold)}
.btnRow{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
a.btn{color:var(--muted2);text-decoration:none;padding:12px 16px;border:1px solid #2c69a5;border-radius:12px}
a.primary{background:#2c69a5;color:#fff;border-color:transparent}
.badges{display:flex;gap:10px;margin-top:10px}
.badges img{height:40px}
.footer{opacity:.55;font-size:12px;margin-top:16px}
`;

// ---------- JS (no iOS auto-open) ----------
const JS = (deep) => `
(function(){
  var deep='${deep}';
  var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  var isAndroid = /Android/i.test(navigator.userAgent);
  var openBtn = document.getElementById('openApp');
  if(openBtn){
    openBtn.addEventListener('click', function(e){
      e.preventDefault();
      window.location.href = deep;
      if (isAndroid) setTimeout(function(){ window.location.href='${PLAY_URL}'; }, 1000);
    });
  }
  if (isAndroid) setTimeout(function(){ openBtn && openBtn.click(); }, 0);
})();`;

// ---------- templates ----------
function renderBase({ title, desc, deep, web, innerHTML }) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(web)}">
<meta name="twitter:card" content="summary">
<style>${CSS}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="title">${esc(title)}</div>
      <div class="desc">${esc(desc)}</div>

      ${innerHTML}

      <div class="btnRow">
        <a class="btn primary" id="openApp" href="${esc(deep)}">Open in the app</a>
        <a class="btn" href="${esc(web)}">View on web</a>
      </div>

      <div class="badges">
        <a href="${APPSTORE_URL}"><img alt="App Store" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"></a>
        <a href="${PLAY_URL}"><img alt="Google Play" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"></a>
      </div>

      <div class="footer">UBC First Year Life</div>
    </div>
  </div>
<script>${JS(esc(deep))}</script>
</body></html>`;
}

function confessionInner({ residence, preview, ci, len, submittedAt }) {
  const dotsHtml = Number.isFinite(len) && len > 1 ? `<div class="dotsRow">${dots(len, ci)}</div>` : '';
  return `
  <div class="confShell">
    <div class="confHeader">
      <h2>${esc(residence)} Confessions</h2>
      <p>Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.</p>
      <p class="fine">All confessions are anonymous.</p>
    </div>
    <div class="confBody">${esc(preview || 'Open in the app to view this confession.')}</div>
    ${submittedAt ? `<div class="timestamp">Submitted ${esc(submittedAt)}</div>` : ''}
  </div>
  ${dotsHtml}
  `;
}

function postInner({ username, caption, ci, len }) {
  const dotsHtml = Number.isFinite(len) && len > 1 ? `<div class="dotsRow">${dots(len, ci)}</div>` : '';
  return `
  <div class="confShell">
    <div class="confHeader">
      <h2>${esc(username)}’s post</h2>
      <p class="fine">Shared from UBC First Year Life</p>
    </div>
    <div class="confBody">${esc(caption || 'Open in the app to view this post.')}</div>
  </div>
  ${dotsHtml}
  `;
}

// ---------- routes ----------
router.get('/cg/:residence/:postId', (req, res) => {
  const { residence, postId } = req.params;
  const ci   = Number(req.query.ci) || 0;
  const len  = Number(req.query.len);          // optional: pass ?len=5 if you know total
  const pv   = trim(req.query.pv || '');       // optional preview text
  const deep = `${APP_SCHEME}cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${qci(ci)}`;
  const web  = `${WEB_BASE}/cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${qci(ci)}${pv?`&pv=${encodeURIComponent(pv)}`:''}`;

  const innerHTML = confessionInner({ residence, preview: pv, ci, len, submittedAt: '' });
  const html = renderBase({
    title: 'Shared confession',
    desc:  'Open this confession in UBC First Year Life',
    deep, web, innerHTML
  });
  res.type('html').send(html);
});

router.get('/p/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const ci   = Number(req.query.ci) || 0;
  const len  = Number(req.query.len);
  const pv   = trim(req.query.pv || '');
  const deep = `${APP_SCHEME}post/${encodeURIComponent(shortcode)}${qci(ci)}`;
  const web  = `${WEB_BASE}/p/${encodeURIComponent(shortcode)}${qci(ci)}${pv?`&pv=${encodeURIComponent(pv)}`:''}`;

  const innerHTML = postInner({ username: 'Shared post', caption: pv, ci, len });
  const html = renderBase({
    title: 'Shared post',
    desc:  'Open this post in UBC First Year Life',
    deep, web, innerHTML
  });
  res.type('html').send(html);
});

module.exports = router;
