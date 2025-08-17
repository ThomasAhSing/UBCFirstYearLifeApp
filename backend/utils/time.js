// utils/time.js
const { DateTime } = require('luxon');

const PT = 'America/Vancouver';

// 7:00 PM PT today -> JS Date in UTC
function tonight7pmUTC() {
  const dt = DateTime.now().setZone(PT).set({ hour: 19, minute: 0, second: 0, millisecond: 0 });
  return dt.toUTC().toJSDate();
}

// reuturn postedAtUtc to "YYYY-MM-DD" vancouver time
function dateKeyFor(postedAtUtc) {
  return DateTime.fromJSDate(postedAtUtc, { zone: 'utc' })
    .setZone(PT)
    .toFormat('yyyy-LL-dd');
}

// return if current time is before today 7pm locally
function isBefore7pmLocal() {
  const now = DateTime.now().setZone(PT);
  return now < now.set({ hour: 19, minute: 0, second: 0, millisecond: 0 });
}

// PT start/end of "today" as UTC JS Dates
function startOfTodayUTC() {
  return DateTime.now().setZone(PT).startOf('day').toUTC().toJSDate();
}
function endOfTodayUTC() {
  return DateTime.now().setZone(PT).endOf('day').toUTC().toJSDate();
}

module.exports = { PT, tonight7pmUTC, dateKeyFor, isBefore7pmLocal, startOfTodayUTC, endOfTodayUTC };
