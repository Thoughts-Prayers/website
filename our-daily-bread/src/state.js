const key = (date) => `moves:${date}`;

export function getMoves(date) {
  return Number(localStorage.getItem(key(date)) || 0);
}
export function setMoves(date, n) {
  localStorage.setItem(key(date), String(n));
}
export function clearMoves(date) {
  localStorage.removeItem(key(date));
}
