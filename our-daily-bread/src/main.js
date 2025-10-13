import { START_DATE, GRID_SIZE, IMAGES, IMAGE_DIR, IMAGE_COUNT } from './config.js';
import { todayLocal, daysSince } from './date-utils.js';
import { makeRng } from './rng.js';
import { createPuzzle } from './puzzle-engine.js';
import { getMoves, setMoves } from './state.js';
import { wireUI, setMovesUI, showSolved, resetSolvedUI } from './ui.js';

function imageFor(dayIndex) {
  if (IMAGES && IMAGES.length) return `./assets/images/${IMAGES[dayIndex]}`;
  if (dayIndex < 0 || dayIndex >= IMAGE_COUNT) return null;
  const name = String(dayIndex + 1).padStart(2,'0');
  return `${IMAGE_DIR}/${name}.jpg`;
}

let currentDate = todayLocal();
let moves = 0;
let puzzleApi = null;

async function boot() {
  const dayIndex = daysSince(START_DATE, currentDate);
  const img = imageFor(dayIndex);
  const container = document.getElementById('puzzle');
  if (!img) {
    container.textContent = 'No puzzle today.';
    return;
  }
  const rng = makeRng(dayIndex);

  moves = getMoves(currentDate) || 0;
  setMovesUI(moves);
  resetSolvedUI();

  puzzleApi = await createPuzzle({
    container,
    imageUrl: img,
    gridSize: GRID_SIZE,
    rng,
    onMove: () => {
      moves += 1;
      setMovesUI(moves);
      setMoves(currentDate, moves);
      window.navigator?.vibrate?.(10);
    },
    onSolved: () => {
      showSolved(moves);
    }
  });

  wireUI({
    onSolve: () => {
      puzzleApi?.solveNext?.();
    }
  });
}

boot();

// Detect local date change while open
setInterval(() => {
  const now = todayLocal();
  if (now !== currentDate) location.reload();
}, 60_000);
