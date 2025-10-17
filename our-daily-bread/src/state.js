const key = (date, gridSize) => `moves:${date}:${gridSize}`;

export function getMoves(date, gridSize) {
  try {
    return Number(localStorage.getItem(key(date, gridSize)) || 0);
  } catch (err) {
    return 0;
  }
}
export function setMoves(date, gridSize, n) {
  try {
    localStorage.setItem(key(date, gridSize), String(n));
  } catch (err) {
    // ignore storage failures
  }
}
export function clearMoves(date, gridSize) {
  try {
    localStorage.removeItem(key(date, gridSize));
  } catch (err) {
    // ignore storage failures
  }
}
