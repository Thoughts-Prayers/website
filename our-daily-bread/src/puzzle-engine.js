// Puzzle engine: TAP-TO-SWAP ONLY
export async function createPuzzle(opts) {
  const {
    container,
    imageUrl,
    gridSize,
    rng,               // function returning [0,1)
    onMove = () => {},
    onSolved = () => {},
  } = opts;

  await loadImage(imageUrl);

  container.innerHTML = '';
  container.classList.remove('puzzle-solved');

  const N = gridSize * gridSize;

  // seeded Fisher–Yates to get a permutation of original tiles
  const perm = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  if (!perm.some((value, idx) => value === idx)) {
    // Guarantee at least one fixed point so the puzzle starts with a reassuring anchor.
    const destToFix = Math.floor(rng() * N);
    const currentIndex = perm.indexOf(destToFix);
    [perm[destToFix], perm[currentIndex]] = [perm[currentIndex], perm[destToFix]];
  }

  // destIndex -> tile
  const slots = new Array(N);
  const tiles = [];

  for (let dest = 0; dest < N; dest++) {
    const orig = perm[dest];
    const t = makeTile({
      container, imageUrl, gridSize,
      origIndex: orig, destIndex: dest
    });
    slots[dest] = t;
    tiles.push(t);
    updateLockState(t);
  }

  let tileSize = 0;
  let boardSize = 0;
  let solved = isSolved(slots);
  container.classList.toggle('puzzle-solved', solved);

  const layout = () => {
    const size = computeTargetSize(container);
    if (!size) return;

    const nextTileSize = Math.max(1, Math.floor(size / gridSize));
    const nextBoardSize = nextTileSize * gridSize;
    if (nextTileSize === tileSize && nextBoardSize === boardSize) return;

    tileSize = nextTileSize;
    boardSize = nextBoardSize;

    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    tiles.forEach(tile => {
      tile.el.style.width = `${tileSize}px`;
      tile.el.style.height = `${tileSize}px`;
      tile.el.style.backgroundSize = `${boardSize}px ${boardSize}px`;
      tile.el.style.backgroundPosition = `-${tile.origCol * tileSize}px -${tile.origRow * tileSize}px`;
      positionTile(tile, tileSize, gridSize);
    });
  };

  layout();
  requestAnimationFrame(() => {
    flashAllLockedTiles();
  });

  const teardownFns = [];
  const parent = container.parentElement;

  if (parent && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(layout);
    ro.observe(parent);
    teardownFns.push(() => ro.disconnect());
  }

  const handleWindowResize = () => layout();
  window.addEventListener('resize', handleWindowResize);
  teardownFns.push(() => window.removeEventListener('resize', handleWindowResize));

  // --- tap-to-swap ---
  let selected = null;

  function clearSelection() {
    if (selected) selected.el.classList.remove('selected');
    selected = null;
  }

  tiles.forEach(tile => {
    tile.el.addEventListener('click', (e) => {
      e.preventDefault();

      if (tile.locked) {
        jiggleAllLockedTiles();
        flashAllLockedTiles();
        return;
      }

      if (!selected) {
        selected = tile;
        tile.el.classList.add('selected');
        return;
      }

      if (selected === tile) {
        // tap same tile again: deselect
        clearSelection();
        return;
      }

      // swap selected <-> tile
      const a = selected.destIndex;
      const b = tile.destIndex;
      clearSelection();
      swapByDest(a, b, true);
    });
  });

  function swapByDest(destA, destB, countMove = true) {
    if (destA === destB) return false;

    const tileA = slots[destA];
    const tileB = slots[destB];
    if (!tileA || !tileB) return false;

    slots[destA] = tileB;
    slots[destB] = tileA;

    tileA.destIndex = destB;
    tileB.destIndex = destA;

    if (!tileSize) layout();
    positionTile(tileA, tileSize, gridSize);
    positionTile(tileB, tileSize, gridSize);
    updateLockState(tileA);
    updateLockState(tileB);
    flashAllLockedTiles();

    if (countMove) onMove();
    setSolvedState(isSolved(slots));
    return true;
  }

  function solveNextPiece() {
    clearSelection();
    for (let dest = 0; dest < slots.length; dest++) {
      const tile = slots[dest];
      if (tile.origIndex === dest) continue;
      const swapIndex = slots.findIndex(t => t.origIndex === dest);
      if (swapIndex === -1) return false;
      swapByDest(dest, swapIndex, false);
      return true;
    }
    return false;
  }

  function teardown() {
    teardownFns.forEach(fn => fn());
    container.innerHTML = '';
  }

  return { teardown, resize: layout, solveNext: solveNextPiece };

  // helpers
  function updateLockState(tile) {
    const isLocked = tile.destIndex === tile.origIndex;
    tile.locked = isLocked;
    tile.el.classList.toggle('locked', isLocked);
    tile.el.classList.toggle('misplaced', !isLocked);
  }

  function flashAllLockedTiles() {
    tiles.forEach(tile => {
      if (tile.locked) triggerCheckmark(tile.el);
    });
  }

  function jiggleAllLockedTiles() {
    tiles.forEach(tile => {
      if (tile.locked) triggerJiggle(tile);
    });
  }

  function triggerCheckmark(el) {
    el.classList.remove('flash-check');
    void el.offsetWidth;
    el.classList.add('flash-check');
    const handle = (event) => {
      if (event.animationName === 'tile-checkmark') {
        el.classList.remove('flash-check');
      }
    };
    el.addEventListener('animationend', handle, { once: true });
  }

  function triggerJiggle(tile) {
    const { el } = tile;
    el.classList.remove('jiggle');
    // force reflow so animation retriggers
    void el.offsetWidth;
    el.classList.add('jiggle');
    const handle = () => {
      el.classList.remove('jiggle');
      el.removeEventListener('animationend', handle);
    };
    el.addEventListener('animationend', handle);
  }

  function setSolvedState(nextSolved) {
    if (nextSolved === solved) return;
    solved = nextSolved;
    container.classList.toggle('puzzle-solved', solved);
    if (solved) onSolved();
  }

  function isSolved(slotsMap) {
    for (let i = 0; i < slotsMap.length; i++) {
      if (slotsMap[i].origIndex !== i) return false;
    }
    return true;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeTile({ container, imageUrl, gridSize, origIndex, destIndex }) {
  const el = document.createElement('div');
  el.className = 'tile';

  const origRow = Math.floor(origIndex / gridSize);
  const origCol = origIndex % gridSize;

  el.style.backgroundImage = `url(${imageUrl})`;

  const tile = { el, origIndex, destIndex, origRow, origCol, locked: false };
  container.appendChild(el);
  return tile;
}

function positionTile(tile, tileSize, gridSize) {
  const destRow = Math.floor(tile.destIndex / gridSize);
  const destCol = tile.destIndex % gridSize;
  tile.el.style.left = `${destCol * tileSize}px`;
  tile.el.style.top  = `${destRow * tileSize}px`;
}

function computeTargetSize(container) {
  const parent = container.parentElement;

  if (parent) {
    const rect = parent.getBoundingClientRect();
    const style = window.getComputedStyle(parent);
    const usableWidth = Math.max(0, rect.width - toNumber(style.paddingLeft) - toNumber(style.paddingRight));
    const usableHeight = Math.max(0, rect.height - toNumber(style.paddingTop) - toNumber(style.paddingBottom));
    const size = Math.floor(Math.min(usableWidth, usableHeight));
    if (size > 0) return size;
  }

  const fallback = Math.floor(Math.min(window.innerWidth, window.innerHeight));
  return fallback > 0 ? fallback : 0;
}

function toNumber(value) {
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}
