const express = require('express');
const router = express.Router();

const APP_SCHEME = (process.env.APP_SCHEME || 'ubcfirstyear') + '://';
const WEB_BASE = (process.env.WEB_BASE || 'https://ubcfirstyearlifeapp.onrender.com').replace(/\/+$/, '');

const page = ({ title, desc, deep, web }) => `<!doctype html>...`; // (keep the full HTML from earlier)

router.get('/p/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    const ci = Number(req.query.ci) || 0;
    const deep = `${APP_SCHEME}post/${encodeURIComponent(shortcode)}${ci >= 0 ? `?ci=${ci}` : ''}`;
    const web = `${WEB_BASE}/p/${encodeURIComponent(shortcode)}${ci >= 0 ? `?ci=${ci}` : ''}`;
    res.type('html').send(page({ title: 'Shared post', desc: 'Open this post in UBC First Year Life', deep, web }));
});

router.get('/cg/:residence/:postId', (req, res) => {
    const { residence, postId } = req.params;
    const ci = Number(req.query.ci) || 0;
    const deep = `${APP_SCHEME}cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${ci >= 0 ? `?ci=${ci}` : ''}`;
    const web = `${WEB_BASE}/cg/${encodeURIComponent(residence)}/${encodeURIComponent(postId)}${ci >= 0 ? `?ci=${ci}` : ''}`;
    res.type('html').send(page({ title: 'Shared confession', desc: 'Open this confession in UBC First Year Life', deep, web }));
});

module.exports = router;
