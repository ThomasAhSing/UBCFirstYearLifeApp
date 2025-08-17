// normalizes residence names to URL safe url
function slug(s) {
  return (s || 'unknown')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'unknown';
}
module.exports = { slug };