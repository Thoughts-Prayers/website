import { ANIMALS } from './animals.js';
import { MemoryGame } from './game.js';
import {
  BUILD_VERSION,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  STORAGE_KEYS,
} from './config.js';

const dom = {
  difficulty: document.querySelector('#difficulty'),
  matchedPairs: document.querySelector('#matched-pairs'),
  moves: document.querySelector('#move-counter'),
  timer: document.querySelector('#timer'),
  arkStatus: document.querySelector('#ark-status'),
  gridLabel: document.querySelector('#grid-label'),
  difficultyLabel: document.querySelector('#difficulty-label'),
  factPanel: document.querySelector('.fact-panel'),
  factBody: document.querySelector('#fact-body'),
  shareButton: document.querySelector('#share'),
  restartButton: document.querySelector('#restart'),
  grid: document.querySelector('#game-grid'),
};

const state = {
  difficultyId: DEFAULT_DIFFICULTY,
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  startTimestamp: 0,
  elapsedMs: 0,
  timerId: null,
  completed: false,
  rows: 0,
  cols: 0,
};

const loadLocalSetting = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const saveLocalSetting = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
};

const findDifficulty = (difficultyId) =>
  DIFFICULTIES.find((entry) => entry.id === difficultyId) ??
  DIFFICULTIES[0];

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDifficultyLabel = (difficulty) =>
  `${difficulty.label} (${difficulty.rows}×${difficulty.cols})`;

const updateHud = () => {
  dom.matchedPairs.textContent = `${state.matchedPairs} / ${state.totalPairs}`;
  dom.moves.textContent = state.moves.toString();
  dom.timer.textContent = formatTime(state.elapsedMs);
};

const updateArkStatus = (message) => {
  dom.arkStatus.textContent = message;
};

const stopTimer = () => {
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
};

const startTimer = () => {
  stopTimer();
  state.startTimestamp = performance.now();
  state.elapsedMs = 0;
  dom.timer.textContent = '0:00';

  state.timerId = window.setInterval(() => {
    state.elapsedMs = performance.now() - state.startTimestamp;
    dom.timer.textContent = formatTime(state.elapsedMs);
  }, 1000);
};

const showFact = ({ emoji, name, fact }) => {
  dom.factBody.textContent = `${emoji} ${name}: ${fact}`;
  dom.factPanel.hidden = false;
};

const hideFact = () => {
  dom.factPanel.hidden = true;
  dom.factBody.textContent = '';
};

const composeShareText = () => {
  const difficulty = findDifficulty(state.difficultyId);
  const timeText = formatTime(state.elapsedMs);
  const headline = `Noah’s Ark: Two by Two`;
  const stats = `${state.matchedPairs}/${state.totalPairs} pairs • ${state.moves} moves`;
  return `${headline}\nDifficulty: ${formatDifficultyLabel(difficulty)}\nTime: ${timeText}\n${stats}\n${window.location.href}`;
};

const handleShare = async () => {
  const shareText = composeShareText();

  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText,
        title: 'Noah’s Ark: Two by Two',
      });
      updateArkStatus('Shared! Invite friends to sail along.');
      return;
    } catch {
      // Fallback to clipboard path when share dialog is dismissed or unsupported
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    updateArkStatus('Result copied! Invite friends to sail along.');
  } catch {
    updateArkStatus('Unable to copy result. Try again or use your device share menu.');
  }
};

const onMove = (moves) => {
  state.moves = moves;
  updateHud();
};

const onMatch = (payload) => {
  state.matchedPairs = payload.matchedPairs;
  state.totalPairs = payload.totalPairs;

  updateHud();
  updateArkStatus(`Boarding: ${state.matchedPairs} of ${state.totalPairs} pairs aboard.`);
  showFact({
    emoji: payload.emoji,
    name: payload.name,
    fact: payload.fact,
  });
};

const onMismatch = () => {
  updateArkStatus('Rain picks up! Focus and try again.');
};

const onComplete = () => {
  stopTimer();
  state.completed = true;
  state.elapsedMs = performance.now() - state.startTimestamp;
  updateHud();
  updateArkStatus('Ark sealed! A rainbow crowns the voyage.');
  dom.shareButton.disabled = false;
};

const game = new MemoryGame({
  grid: dom.grid,
  animals: ANIMALS,
  onMove,
  onMatch,
  onMismatch,
  onComplete,
});

const populateDifficultyOptions = () => {
  dom.difficulty.innerHTML = '';
  DIFFICULTIES.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = formatDifficultyLabel(entry);
    dom.difficulty.appendChild(option);
  });
};

const startGame = (difficultyId) => {
  const difficulty = findDifficulty(difficultyId);
  state.difficultyId = difficulty.id;
  state.rows = difficulty.rows;
  state.cols = difficulty.cols;
  state.totalPairs = (difficulty.rows * difficulty.cols) / 2;
  state.matchedPairs = 0;
  state.moves = 0;
  state.completed = false;
  state.elapsedMs = 0;

  dom.shareButton.disabled = true;
  hideFact();
  updateArkStatus('Awaiting passengers');
  dom.gridLabel.textContent = `${difficulty.rows}×${difficulty.cols}`;
  if (dom.difficultyLabel) {
    dom.difficultyLabel.textContent = formatDifficultyLabel(difficulty);
  }
  dom.difficulty.value = difficulty.id;

  saveLocalSetting(STORAGE_KEYS.DIFFICULTY, difficulty.id);

  game.start({
    rows: difficulty.rows,
    cols: difficulty.cols,
  });

  updateHud();
  startTimer();
};

const init = () => {
  populateDifficultyOptions();

  const storedDifficulty = loadLocalSetting(
    STORAGE_KEYS.DIFFICULTY,
    DEFAULT_DIFFICULTY,
  );
  state.difficultyId = storedDifficulty;
  dom.difficulty.value = storedDifficulty;

  dom.difficulty.addEventListener('change', (event) => {
    const nextDifficulty = event.target.value;
    startGame(nextDifficulty);
  });

  dom.restartButton.addEventListener('click', () => {
    startGame(state.difficultyId);
  });

  dom.shareButton.addEventListener('click', () => {
    if (!state.completed) {
      return;
    }
    handleShare();
  });

  startGame(state.difficultyId);
};

init();

// Expose build version for cache-busting sanity checks.
window.noahsArkTwoByTwo = {
  BUILD_VERSION,
};
