// utils/slug.js ensure generated urls are safe
function slug(s) {
  return (s || 'unknown')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'unknown';
}
module.exports = { slug };
