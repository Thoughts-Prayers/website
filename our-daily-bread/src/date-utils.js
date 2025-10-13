export function todayLocal() {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function toUTCdayNumber(yyyy_mm_dd) {
  const [Y,M,D] = yyyy_mm_dd.split('-').map(Number);
  // Compare by UTC day count to avoid DST issues
  return Date.UTC(Y, M-1, D) / 86400000;
}

export function daysSince(startDateStr, dateStr) {
  return Math.floor(toUTCdayNumber(dateStr) - toUTCdayNumber(startDateStr));
}
