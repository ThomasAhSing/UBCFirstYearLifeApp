// shareRoutes.js
const express = require('express');
const router = express.Router();

// ---------- config ----------
const APP_SCHEME  = (process.env.APP_SCHEME || 'ubcfirstyearlifeapp') + '://';
const WEB_BASE    = (process.env.WEB_BASE || 'https://ubcfirstyearlifeapp.onrender.com').replace(/\/+$/,'');
const APPSTORE_URL= 'https://apps.apple.com/app/idYOUR_APP_ID';                 // TODO
const PLAY_URL    = 'https://play.google.com/store/apps/details?id=YOUR.PACKAGE';// TODO

// Page background (you provided)
const PAGE_BG = '#0C2A42';

// Residence colors (you provided)
const RES_COLORS = {
  PlaceVanier:     { background: '#FFDAD5', accent: '#D65A4E' },
  TotemPark:       { background: '#B0E9E3', accent: '#009688' },
  OrchardCommons:  { background: '#E8DFFB', accent: '#7A5CA0' },
};

// ---------- helpers ----------
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trim = (s='', n=200) => { const t=String(s).replace(/\s+/g,' ').trim(); return t.length>n?t.slice(0,n-1)+'…':t; };
const qci  = (ci) => (Number.isFinite(ci) ? `?ci=${ci}` : '');
const dots = (len=0, active=0) =>
  Array.from({length: Math.max(0,len)}, (_,i)=> `<span class="dot ${i===active?'active':''}"></span>`).join('');
const colorForResidence = (r='') => RES_COLORS[r] || RES_COLORS.TotemPark; // default to Totem if unknown
const humanResidence = (r='') => String(r).replace(/([a-z])([A-Z])/g, '$1 $2');

// ---------- base CSS ----------
const CSS = `
:root{
  --bg:${PAGE_BG};        /* page background (navy) */
  --card:#10253b;         /* main card */
  --border:#173E63;       /* thin navy border */
  --teal:#c8efe8;         /* overridden per-residence */
  --tealTop:#0f8a7c;      /* overridden per-residence */
  --paper:#ffffff;        /* confession card */
  --text:#0b1a2a;         /* dark text on white */
  --muted:#3c586f;        /* subtle grey-blue */
  --muted2:#bcd7f4;       /* light blue text */
  --gold:#F5D054;         /* active dot */
  --goldDim:#A77F2E;      /* inactive dot */
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

/* --- carousel + slide layout (RN look) --- */
.carousel{position:relative;margin-top:14px;overflow:hidden;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:var(--teal)}
.track{display:flex;transition:transform .25s ease}
.slide{min-width:100%;padding:0;display:flex;align-items:center;justify-content:center}
.slideInner{width:100%;max-width:760px;aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:var(--teal)}
.whiteBlock{width:88%;background:#fff;border-radius:10px}
.blockHeader{margin-top:28px;height:32%;border-top:10px solid var(--tealTop)}
.blockBody{margin-top:15px;height:50%}
.heading{font-weight:800;font-size:20px;padding:7px}
.message{font-size:14px;padding:0 7px 5px 7px}
.subheading{font-weight:600;font-size:16px;padding:7px 7px 10px 7px}
.anon{font-style:italic;font-size:14px;padding:0 7px}
.submittedRow{width:100%;display:flex;justify-content:flex-end;margin-top:4px}
.submittedRow span{font-style:italic;color:gray;font-size:12px;padding-right:6%;} /* align to 88% card width */
.navBtn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.35);border:none;color:#fff;border-radius:10px;padding:8px 10px;cursor:pointer}
.navBtn:disabled{opacity:.4;cursor:default}
.navPrev{left:8px}.navNext{right:8px}
`;

// ---------- base JS ----------
const JS = (deep) => `
(function(){
  var deep='${deep}';
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
})();
`;

// Utility + carousel (global)
const JS_UTILS = `
function formatConfessionTimeISO(iso) {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-CA', {
      timeZone: 'America/Los_Angeles',
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch { return ''; }
}
function humanResidence(res) {
  if (!res) return '';
  return String(res).replace(/([a-z])([A-Z])/g, '$1 $2');
}
function buildCarousel({imgs=[], cards=[], slides=[], startIndex=0, residence=''}) {
  try {
    const mount = document.getElementById('carouselMount');
    if (!mount) return;

    const container = document.createElement('div');
    container.className = 'carousel';

    const track = document.createElement('div');
    track.className = 'track';
    container.appendChild(track);

    const makeSlideEl = (html) => {
      const s = document.createElement('div');
      s.className = 'slide';
      s.innerHTML = html;
      return s;
    };

    const slideHTMLFromCard = (card) => {
      const title = humanResidence(residence) + ' Confessions';
      const message = 'Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.';
      const anon = 'All confessions are anonymous.';
      const submitted = formatConfessionTimeISO(card.submittedAt);

      return \`
        <div class="slideInner">
          <div class="whiteBlock blockHeader">
            <div class="heading">\${title}</div>
            <div class="message">\${message}</div>
            <div class="anon">\${anon}</div>
          </div>
          <div class="whiteBlock blockBody">
            <div class="subheading">Insert Confession Below</div>
            <div class="message">\${String(card.content||'').replace(/</g,'&lt;')}</div>
          </div>
          <div class="submittedRow"><span>\${submitted ? 'Submitted ' + submitted : ''}</span></div>
        </div>
      \`;
    };

    let htmlSlides = [];
    if (imgs.length) {
      htmlSlides = imgs.map(src => \`
        <div class="slideInner">
          <div class="whiteBlock blockBody" style="height:88%;display:flex;align-items:center;justify-content:center;">
            <img alt="slide" src="\${src}" style="max-width:88%;max-height:88%;object-fit:contain;border-radius:10px;" />
          </div>
        </div>
      \`);
    } else if (cards.length) {
      htmlSlides = cards.map(slideHTMLFromCard);
    } else if (slides.length) {
      htmlSlides = slides.map(text => \`
        <div class="slideInner">
          <div class="whiteBlock blockHeader">
            <div class="heading">\${humanResidence(residence)} Confessions</div>
            <div class="message">Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.</div>
            <div class="anon">All confessions are anonymous.</div>
          </div>
          <div class="whiteBlock blockBody">
            <div class="subheading">Insert Confession Below</div>
            <div class="message">\${String(text||'').replace(/</g,'&lt;')}</div>
          </div>
          <div class="submittedRow"><span></span></div>
        </div>
      \`);
    }

    htmlSlides.forEach(h => track.appendChild(makeSlideEl(h)));

    const prev = document.createElement('button'); prev.className='navBtn navPrev'; prev.textContent='‹';
    const next = document.createElement('button'); next.className='navBtn navNext'; next.textContent='›';
    container.appendChild(prev); container.appendChild(next);

    mount.appendChild(container);

    let idx = Math.max(0, Math.min(startIndex, htmlSlides.length - 1));
    const setIdx = (i) => {
      idx = Math.max(0, Math.min(i, htmlSlides.length - 1));
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      prev.disabled = (idx === 0);
      next.disabled = (idx === htmlSlides.length - 1);
      document.querySelectorAll('.dot').forEach((d, di) => d.classList.toggle('active', di === idx));
    };

    prev.onclick = () => setIdx(idx - 1);
    next.onclick = () => setIdx(idx + 1);

    // touch swipe
    let startX=null, delta=0;
    container.addEventListener('touchstart',(e)=>{ startX=e.touches[0].clientX; delta=0; },{passive:true});
    container.addEventListener('touchmove',(e)=>{ if(startX!=null) delta=e.touches[0].clientX-startX; },{passive:true});
    container.addEventListener('touchend',()=>{ if(Math.abs(delta)>40) setIdx(idx+(delta<0?1:-1)); startX=null; delta=0; });

    setIdx(idx);
  } catch(e) {
    console.error('carousel error', e);
  }
}
`;

// ---------- HTML renderers ----------
function renderBase({ title, desc, deep, web, innerHTML, overrides={} }) {
  // overrides: { teal, tealTop } injected per page
  const rootOverride = `
    <style>
      :root{
        --teal:${overrides.teal || '#c8efe8'};
        --tealTop:${overrides.tealTop || '#0f8a7c'};
      }
    </style>
  `;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(web)}">
<meta name="twitter:card" content="summary">
<style>${CSS}</style>
${rootOverride}
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
<script>${JS(''+deep)}</script>
<script>${JS_UTILS}</script>
</body></html>`;
}

function confessionInner({ residence, preview, ci, len, submittedAt }) {
  const dotsHtml = Number.isFinite(len) && len > 1 ? `<div class="dotsRow">${dots(len, ci)}</div>` : '';
  return `
  <div class="confShell">
    <div class="confHeader">
      <h2>${esc(humanResidence(residence))} Confessions</h2>
      <p>Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.</p>
      <p class="fine">All confessions are anonymous.</p>
    </div>
    <div class="confBody">${esc(preview || 'Open in the app to view this confession.')}</div>
    ${submittedAt ? `<div class="timestamp">Submitted ${esc(submittedAt)}</div>` : ''}
  </div>
  ${dotsHtml}
  <div id="carouselMount"></div>
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
  <div id="carouselMount"></div>
  `;
}

// ---------- routes ----------
router.get('/cg/:residence/:postId', (req, res) => {
  const { residence, postId } = req.params;
  const ci   = Number(req.query.ci) || 0;
  const lenQ = Number(req.query.len);
  const pv   = trim(req.query.pv || '');

  let imgs = [], slides = [], cards = [];
  try { if (req.query.imgs)   imgs   = JSON.parse(req.query.imgs); }   catch {}
  try { if (req.query.slides) slides = JSON.parse(req.query.slides); } catch {}
  try { if (req.query.cards)  cards  = JSON.parse(req.query.cards); }  catch {}

  const deep = `${APP_SCHEME}cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${qci(ci)}`;
  const web  = `${WEB_BASE}/cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${qci(ci)}${pv?`&pv=${encodeURIComponent(pv)}`:''}`;

  const col = colorForResidence(residence);
  const innerHTML = confessionInner({ residence, preview: pv, ci, len: lenQ, submittedAt: '' });

  const html = renderBase({
    title: 'Shared confession',
    desc:  'Open this confession in UBC First Year Life',
    deep, web, innerHTML,
    overrides: { teal: col.background, tealTop: col.accent }
  });

  const boot = `
    <script>
      (function(){
        var ci=${Number.isFinite(ci)?ci:0};
        var imgs=${JSON.stringify(imgs)};
        var slides=${JSON.stringify(slides)};
        var cards=${JSON.stringify(cards)};
        var len=${Number.isFinite(lenQ)?lenQ:(imgs.length||slides.length||cards.length||0)};
        if(len>1 && !document.querySelector('.dotsRow')){
          var dotsWrap=document.createElement('div');
          dotsWrap.className='dotsRow';
          for(var i=0;i<len;i++){
            var d=document.createElement('span'); d.className='dot'+(i===ci?' active':'');
            dotsWrap.appendChild(d);
          }
          document.querySelector('.card').appendChild(dotsWrap);
        }
        buildCarousel({ imgs: imgs, cards: cards, slides: slides, startIndex: ci, residence: ${JSON.stringify(residence)} });
      })();
    </script>`;
  res.type('html').send(html.replace('</body></html>', boot + '\n</body></html>'));
});

router.get('/p/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const ci   = Number(req.query.ci) || 0;
  const lenQ = Number(req.query.len);
  const pv   = trim(req.query.pv || '');

  let imgs = [], slides = [];
  try { if (req.query.imgs)   imgs   = JSON.parse(req.query.imgs); }   catch {}
  try { if (req.query.slides) slides = JSON.parse(req.query.slides); } catch {}

  const deep = `${APP_SCHEME}post/${encodeURIComponent(shortcode)}${qci(ci)}`;
  const web  = `${WEB_BASE}/p/${encodeURIComponent(shortcode)}${qci(ci)}${pv?`&pv=${encodeURIComponent(pv)}`:''}`;

  // Posts use TotemPark palette by default; adjust if you later pass a residence param
  const innerHTML = postInner({ username: 'Shared post', caption: pv, ci, len: lenQ });
  const html = renderBase({
    title: 'Shared post',
    desc:  'Open this post in UBC First Year Life',
    deep, web, innerHTML,
    overrides: { teal: RES_COLORS.TotemPark.background, tealTop: RES_COLORS.TotemPark.accent }
  });

  const boot = `
    <script>
      (function(){
        var ci=${Number.isFinite(ci)?ci:0};
        var imgs=${JSON.stringify(imgs)};
        var slides=${JSON.stringify(slides)};
        var len=${Number.isFinite(lenQ)?lenQ:(imgs.length||slides.length||0)};
        if(len>1 && !document.querySelector('.dotsRow')){
          var dotsWrap=document.createElement('div');
          dotsWrap.className='dotsRow';
          for(var i=0;i<len;i++){
            var d=document.createElement('span'); d.className='dot'+(i===ci?' active':'');
            dotsWrap.appendChild(d);
          }
          document.querySelector('.card').appendChild(dotsWrap);
        }
        buildCarousel({ imgs: imgs, slides: slides, startIndex: ci, residence: 'TotemPark' });
      })();
    </script>`;
  res.type('html').send(html.replace('</body></html>', boot + '\n</body></html>'));
});

module.exports = router;
