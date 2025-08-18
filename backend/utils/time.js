// utils/time.js
const { DateTime } = require('luxon');

// Default PT; override drop time via env if desired
const PT = 'America/Vancouver';
const DROP_HOUR_LOCAL   = Number.isFinite(Number(process.env.DROP_HOUR_LOCAL))   ? Number(process.env.DROP_HOUR_LOCAL)   : 19; // 7pm
const DROP_MINUTE_LOCAL = Number.isFinite(Number(process.env.DROP_MINUTE_LOCAL)) ? Number(process.env.DROP_MINUTE_LOCAL) : 0;

// --- helpers ---
function nowPT() {
  return DateTime.now().setZone(PT);
}

function cutoffForDayPT(dtPT) {
  return dtPT.set({ hour: DROP_HOUR_LOCAL, minute: DROP_MINUTE_LOCAL, second: 0, millisecond: 0 });
}

function startOfDayUTCForPT(dtPT) {
  return dtPT.startOf('day').toUTC().toJSDate();
}

function endOfDayUTCForPT(dtPT) {
  return dtPT.endOf('day').toUTC().toJSDate();
}

// 7:00 PM PT today -> JS Date in UTC (kept for backward compatibility)
function tonight7pmUTC() {
  const dtPT = nowPT();
  const cutoff = cutoffForDayPT(dtPT);
  return cutoff.toUTC().toJSDate();
}

// Convert a UTC JS Date "postedAt" into a PT dateKey "YYYY-MM-DD"
function dateKeyFor(postedAtUtc) {
  return DateTime.fromJSDate(postedAtUtc, { zone: 'utc' })
    .setZone(PT)
    .toFormat('yyyy-LL-dd');
}

// Return if current time is before today’s drop time in PT
function isBefore7pmLocal() {
  const now = nowPT();
  return now < cutoffForDayPT(now);
}

// PT "today" boundaries as UTC JS Dates (kept for backward compatibility)
function startOfTodayUTC() {
  return startOfDayUTCForPT(nowPT());
}
function endOfTodayUTC() {
  return endOfDayUTCForPT(nowPT());
}

/**
 * Compute the *target* drop slot:
 * - If now is before drop cutoff today → target is today at DROP_HOUR:MINUTE PT
 * - Else → target is tomorrow at DROP_HOUR:MINUTE PT
 * Returns:
 *  {
 *    nowPT,                    // DateTime (PT)
 *    cutoffPT,                 // DateTime (PT) cutoff for "now's" day
 *    targetDropPT,             // DateTime (PT) at drop time for target day
 *    dropAtUTC,                // JS Date (UTC) to write into postedAt
 *    dateKey,                  // "YYYY-MM-DD" in PT for target day
 *    targetStartUTC,           // JS Date UTC start of target day (PT day)
 *    targetEndUTC,             // JS Date UTC end of target day (PT day)
 *  }
 */
function getTargetDropInfo() {
  const _nowPT   = nowPT();
  const _cutoff  = cutoffForDayPT(_nowPT);
  const sameDay  = _nowPT <= _cutoff;
  const targetPT = sameDay ? _cutoff : _cutoff.plus({ days: 1 });

  const dropAtUTC    = targetPT.toUTC().toJSDate();
  const dateKey      = targetPT.toFormat('yyyy-LL-dd');
  const targetStartUTC = startOfDayUTCForPT(targetPT);
  const targetEndUTC   = endOfDayUTCForPT(targetPT);

  return {
    nowPT: _nowPT,
    cutoffPT: _cutoff,
    targetDropPT: targetPT,
    dropAtUTC,
    dateKey,
    targetStartUTC,
    targetEndUTC,
  };
}

module.exports = {
  // constants
  PT,
  DROP_HOUR_LOCAL,
  DROP_MINUTE_LOCAL,

  // legacy/compat exports
  tonight7pmUTC,
  dateKeyFor,
  isBefore7pmLocal,
  startOfTodayUTC,
  endOfTodayUTC,

  // new helpers
  nowPT,
  cutoffForDayPT,
  getTargetDropInfo,
  startOfDayUTCForPT,
  endOfDayUTCForPT,
};
