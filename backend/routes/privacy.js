const express = require('express');
const router = express.Router();

function page() {
  const today = new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy Policy – First Year Life</title>
<meta name="description" content="Privacy Policy for First Year Life, including how we handle giveaway emails.">
<style>
:root{--bg:#0C2A42;--card:#173E63;--text:#e9f1f7;--muted:#b9c7d3;--accent:#47B1E9}
html,body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:900px;margin:48px auto;padding:0 20px}
.card{background:var(--card);border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.25)}
a{color:var(--accent)} h1{margin:0 0 10px}
ul{padding-left:18px}
.pill{display:inline-block;border:1px solid #1e4766;color:var(--muted);padding:6px 10px;border-radius:999px;font-size:12px}
</style>
</head>
<body>
  <div class="wrap"><div class="card">
    <h1>First Year Life - Privacy Policy</h1>
    <span class="pill">Last updated: ${today}</span>

    <p>First Year Life respects your privacy. This policy explains what we collect and how we use it.</p>

    <h2>Data We Collect</h2>
    <ul>
      <li><strong>Notifications permission & token:</strong> If you enable notifications, a device push token is stored to send updates. You can disable notifications in system settings at any time.</li>
      <li><strong>Anonymous confessions:</strong> The content you submit is stored for display and moderation. We do not store your identity with a confession.</li>
      <li><strong>Media from account owners:</strong> We display media provided by or with permission from the original account owners and keep copies for in-app display. All media is obtained through public sources, with consent from the owners to display media.</li>
      <li><strong>Giveaway email (optional):</strong> If you enter a giveaway, we collect the email address you provide to create your personal referral link, track entries, and contact potential winners.</li>
    </ul>

    <h2>How We Use Data</h2>
    <ul>
      <li>Send notifications you opt into.</li>
      <li>Operate and moderate content, including removing violations of our Terms.</li>
      <li>Improve reliability and safety of the service.</li>
      <li><strong>Giveaway:</strong> Generate your referral link, track entries, prevent abuse/fraud, and notify potential winners via the email you provided.</li>
    </ul>

    <h2>Sharing & Selling</h2>
    <p>We do <strong>not</strong> sell your personal information. We use standard service providers to host the app, store data, send notifications, and deliver media (e.g., Render for hosting, MongoDB Atlas for database, Firebase Storage/CDN for media, and Expo/APNs/FCM for push). These providers process data on our behalf under agreements. Giveaway emails are <strong>not</strong> shared for advertising or cross-app tracking.</p>

    <h2>Retention</h2>
    <ul>
      <li>Push tokens are retained while you are subscribed to notifications.</li>
      <li>Submitted content is retained while displayed or needed for moderation/security.</li>
      <li><strong>Giveaway emails:</strong> Retained until winners are confirmed, then deleted or anonymized within <strong>60 days</strong>.</li>
    </ul>

    <h2>Your Choices</h2>
    <ul>
      <li>Disable notifications in your device settings.</li>
      <li>Email us to request removal of content you posted.</li>
      <li><strong>Giveaway email:</strong> You may request deletion of your giveaway email at any time; note this may remove your entries.</li>
    </ul>

    <h2>Contact</h2>
    <p>Email: <a href="mailto:ahsingthomas@gmail.com">ahsingthomas@gmail.com</a></p>

    <p><a href="/support">Back to Support</a> • <a href="/terms">Terms of Use</a></p>
  </div></div>
</body>
</html>`;
}

router.get('/', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.type('html').send(page());
});

module.exports = router;
