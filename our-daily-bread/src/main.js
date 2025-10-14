import { START_DATE, GRID_SIZE, IMAGES, IMAGE_DIR, IMAGE_COUNT } from './config.js';
import { todayLocal, daysSince } from './date-utils.js';
import { makeRng } from './rng.js';
import { createPuzzle } from './puzzle-engine.js';
import { getMoves, setMoves, clearMoves } from './state.js';
import { wireUI, setMovesUI, showSolved, resetSolvedUI } from './ui.js';

const BUILD_VERSION = '20250212';
const VERSION_STORAGE_KEY = 'odb-build-version';

function ensureFreshCache() {
  if (typeof window === 'undefined') return;

  let previous = null;
  try {
    previous = window.localStorage.getItem(VERSION_STORAGE_KEY);
  } catch (err) {
    // ignore storage access issues (private mode, etc.)
  }

  if (previous === BUILD_VERSION) return;

  if (previous !== null) {
    if ('caches' in window) {
      caches.keys()
        .then(keys => Promise.all(keys.map(key => caches.delete(key))))
        .catch(() => {});
    }

    const { serviceWorker } = window.navigator;
    if (serviceWorker && typeof serviceWorker.getRegistrations === 'function') {
      serviceWorker.getRegistrations()
        .then(registrations => {
          registrations.forEach(reg => {
            reg.update?.();
            if (reg.waiting && typeof reg.waiting.postMessage === 'function') {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        })
        .catch(() => {});
    }
  }

  try {
    window.localStorage.setItem(VERSION_STORAGE_KEY, BUILD_VERSION);
  } catch (err) {
    // best effort only
  }
}

ensureFreshCache();

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

  clearMoves(currentDate);
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
