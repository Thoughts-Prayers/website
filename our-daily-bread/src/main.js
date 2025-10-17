import { START_DATE, DEFAULT_GRID_SIZE, GRID_SIZE_OPTIONS, IMAGES, IMAGE_DIR } from './config.js';
import { todayLocal, daysSince } from './date-utils.js';
import { makeRng } from './rng.js';
import { createPuzzle } from './puzzle-engine.js';
import { setMoves, clearMoves } from './state.js';
import { wireUI, setMovesUI, showSolved, resetSolvedUI, setShareResult } from './ui.js';

const BUILD_VERSION = '20250222';
const VERSION_STORAGE_KEY = 'odb-build-version';
const GRID_STORAGE_KEY = 'odb-grid-size';

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
  if (dayIndex < 0) return null;
  if (IMAGES && IMAGES.length) {
    const imageName = IMAGES[dayIndex];
    return imageName ? `${IMAGE_DIR}/${imageName}` : null;
  }
  const name = String(dayIndex + 1).padStart(2,'0');
  return `${IMAGE_DIR}/${name}.jpg`;
}

function fallbackImageUrl() {
  const fallbackName = (IMAGES && IMAGES.length) ? IMAGES[0] : '01.jpg';
  if (!fallbackName) return null;
  return `${IMAGE_DIR}/${fallbackName}`;
}

const GRID_SIZE_VALUES = Array.from(new Set(
  (GRID_SIZE_OPTIONS || [])
    .map(opt => Number.parseInt(opt?.value, 10))
    .filter(n => Number.isInteger(n) && n >= 2)
));
if (!GRID_SIZE_VALUES.includes(DEFAULT_GRID_SIZE)) {
  GRID_SIZE_VALUES.push(DEFAULT_GRID_SIZE);
}
GRID_SIZE_VALUES.sort((a, b) => a - b);

let currentDate = todayLocal();
let moves = 0;
let puzzleApi = null;
let container = null;
let dayIndex = 0;
let imageUrl = null;
let gridSize = DEFAULT_GRID_SIZE;
let isBuilding = false;
let rebuildQueued = false;
let puzzleLabel = '';

const SHARE_URL = 'https://thoughtsandprayersfoundation.org/our-daily-bread/';

function formatPuzzleLabel(index) {
  const number = index + 1;
  return `#${String(number).padStart(2, '0')}`;
}

function formatShareText(moveCount) {
  const movesLabel = moveCount === 1 ? 'move' : 'moves';
  return `${SHARE_URL}\nI solved Our Daily Bread 🖼️ ${puzzleLabel} (${gridSize}x${gridSize}) in ${moveCount} ${movesLabel}.`;
}

function normalizeGridSize(value) {
  const parsed = (typeof value === 'number') ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 2) return DEFAULT_GRID_SIZE;
  return GRID_SIZE_VALUES.includes(parsed) ? parsed : DEFAULT_GRID_SIZE;
}

function loadGridSizePreference() {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_GRID_SIZE;
  try {
    const stored = window.localStorage.getItem(GRID_STORAGE_KEY);
    if (stored !== null) {
      return normalizeGridSize(stored);
    }
  } catch (err) {
    // ignore storage access failures
  }
  return DEFAULT_GRID_SIZE;
}

function persistGridSizePreference(size) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(GRID_STORAGE_KEY, String(size));
  } catch (err) {
    // ignore storage access failures
  }
}

function setupDifficultyControl() {
  const select = document.getElementById('difficulty');
  if (!select || !Array.isArray(GRID_SIZE_OPTIONS) || GRID_SIZE_OPTIONS.length === 0) return;

  select.innerHTML = '';
  GRID_SIZE_OPTIONS.forEach((optionConfig) => {
    const value = Number.parseInt(optionConfig?.value, 10);
    if (!Number.isInteger(value) || value < 2) return;
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = optionConfig?.label || `${value}x${value}`;
    select.appendChild(option);
  });

  const fallbackOptionExists = Array.from(select.options).some(opt => Number.parseInt(opt.value, 10) === gridSize);
  if (!fallbackOptionExists) {
    const option = document.createElement('option');
    option.value = String(gridSize);
    option.textContent = `${gridSize}x${gridSize}`;
    select.appendChild(option);
  }

  select.value = String(gridSize);

  select.addEventListener('change', (event) => {
    const next = normalizeGridSize(event.target.value);
    if (next === gridSize) {
      select.value = String(gridSize);
      return;
    }
    gridSize = next;
    persistGridSizePreference(gridSize);
    resetSolvedUI();
    moves = 0;
    setMovesUI(moves);
    clearMoves(currentDate, gridSize);
    if (isBuilding) {
      rebuildQueued = true;
      return;
    }
    createOrResetPuzzle();
  });
}

async function createOrResetPuzzle() {
  if (!container || !imageUrl) return;
  if (isBuilding) {
    rebuildQueued = true;
    return;
  }
  isBuilding = true;

  try {
    puzzleApi?.teardown?.();
    clearMoves(currentDate, gridSize);
    moves = 0;
    setMovesUI(moves);
    setMoves(currentDate, gridSize, moves);
    resetSolvedUI();

    const rng = makeRng(dayIndex);
    const built = await tryBuildPuzzle(imageUrl, rng);
    if (built) return;

    const fallbackUrl = fallbackImageUrl();
    if (fallbackUrl && fallbackUrl !== imageUrl) {
      console.warn('Retrying puzzle build with fallback image', fallbackUrl);
      const fallbackBuilt = await tryBuildPuzzle(fallbackUrl, rng);
      if (fallbackBuilt) {
        imageUrl = fallbackUrl;
        return;
      }
    }

    showMissingPuzzle();
  } finally {
    isBuilding = false;
    if (rebuildQueued) {
      rebuildQueued = false;
      await createOrResetPuzzle();
    }
  }
}

function showMissingPuzzle() {
  puzzleApi = null;
  container.textContent = 'No puzzle today.';
  setShareResult('');
}

async function tryBuildPuzzle(url, rng) {
  if (!url) return false;
  try {
    puzzleApi = await createPuzzle({
      container,
      imageUrl: url,
      gridSize,
      rng,
      onMove: () => {
        moves += 1;
        setMovesUI(moves);
        setMoves(currentDate, gridSize, moves);
        window.navigator?.vibrate?.(10);
      },
      onSolved: () => {
        showSolved(moves);
        setShareResult(formatShareText(moves));
      }
    });
    return true;
  } catch (err) {
    console.error('Failed to build puzzle for', url, err);
    return false;
  }
}

async function boot() {
  gridSize = loadGridSizePreference();
  dayIndex = daysSince(START_DATE, currentDate);
  imageUrl = imageFor(dayIndex);
  container = document.getElementById('puzzle');
  puzzleLabel = formatPuzzleLabel(dayIndex);
  setupDifficultyControl();
  if (!container) return;

  if (!imageUrl) {
    setShareResult('');
    container.textContent = 'No puzzle today.';
    return;
  }

  await createOrResetPuzzle();

  wireUI({
    onReset: () => createOrResetPuzzle(),
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
