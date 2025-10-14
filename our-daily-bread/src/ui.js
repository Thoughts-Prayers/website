const statusEl = document.getElementById('status');
const habitEl = document.getElementById('habit-cta');
const shareBtn = document.getElementById('share');
const shareContainer = document.querySelector('.share-actions');
const shareDefaultLabel = shareBtn ? (shareBtn.textContent || 'Share results') : 'Share results';
const devMenu = document.getElementById('dev-menu');
const devMenuCloseBtn = document.getElementById('dev-menu-close');
let shareMessage = '';
let shareResetTimer = null;
let twoFingerTapCount = 0;
let twoFingerTapTimer = null;
let gesturesBound = false;

export function wireUI({ onReset, onSolve }) {
  const resetBtn = document.getElementById('reset');
  if (resetBtn && typeof onReset === 'function') {
    resetBtn.addEventListener('click', () => {
      resetBtn.blur();

      const result = onReset();
      hideDevMenu();
      if (result && typeof result.then === 'function') {
        resetBtn.disabled = true;
        result.finally(() => {
          resetBtn.disabled = false;
          hideDevMenu();
        });
      }
    });
  }

  if (shareBtn) {
    shareBtn.disabled = true;
    shareBtn.addEventListener('click', async () => {
      if (!shareMessage || shareBtn.disabled) return;
      shareBtn.disabled = true;
      shareBtn.blur();

      let feedback = '';
      try {
        if (navigator.share && (!navigator.canShare || navigator.canShare({ text: shareMessage }))) {
          await navigator.share({ text: shareMessage });
          feedback = 'Shared!';
        } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(shareMessage);
          feedback = 'Copied!';
        } else {
          feedback = 'Copy unavailable';
        }
      } catch (err) {
        if (!err || err.name !== 'AbortError') {
          feedback = 'Try again';
        }
      } finally {
        if (feedback) {
          if (shareResetTimer) {
            clearTimeout(shareResetTimer);
            shareResetTimer = null;
          }
          shareBtn.textContent = feedback;
          shareResetTimer = window.setTimeout(() => {
            shareBtn.textContent = shareDefaultLabel;
            shareResetTimer = null;
          }, 1800);
        } else {
          shareBtn.textContent = shareDefaultLabel;
        }
        shareBtn.disabled = !shareMessage;
      }
    });
  }

  if (typeof onSolve === 'function') {
    const handleKeydown = (event) => {
      if (event.defaultPrevented) return;
      if (event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (typeof event.key !== 'string') return;
      if (event.key.toLowerCase() !== 's') return;

      const target = event.target;
      const tagName = (target && typeof target.tagName === 'string') ? target.tagName.toLowerCase() : '';
      const isEditable = Boolean(target && target.isContentEditable);
      if (tagName && (tagName === 'input' || tagName === 'textarea' || tagName === 'select')) return;
      if (isEditable) return;

      event.preventDefault();
      onSolve();
    };

    document.addEventListener('keydown', handleKeydown);
  }

  if (!gesturesBound && devMenu) {
    gesturesBound = true;
    document.addEventListener('touchstart', handleTwoFingerTap, { passive: true });
    document.addEventListener('keydown', handleDevKeydown);
  }

  if (devMenuCloseBtn) {
    devMenuCloseBtn.addEventListener('click', hideDevMenu);
  }
}

export function setMovesUI(n) {
  document.getElementById('moves').textContent = String(n);
}

export function showSolved(n) {
  if (!statusEl) return;
  statusEl.textContent = `Solved in ${n} moves! 🎉`;
  statusEl.classList.add('is-solved');
  if (habitEl) {
    habitEl.hidden = false;
    habitEl.classList.add('is-visible');
  }
}

export function resetSolvedUI() {
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('is-solved');
  }
  if (habitEl) {
    habitEl.hidden = true;
    habitEl.classList.remove('is-visible');
  }
  setShareResult('');
  hideDevMenu();
}

export function setShareResult(text) {
  shareMessage = (typeof text === 'string' && text.trim().length) ? text.trim() : '';
  if (!shareBtn) return;
  if (shareResetTimer) {
    clearTimeout(shareResetTimer);
    shareResetTimer = null;
  }
  shareBtn.textContent = shareDefaultLabel;
  shareBtn.disabled = !shareMessage;
  if (shareContainer) {
    shareContainer.hidden = !shareMessage;
  }
}

function handleTwoFingerTap(event) {
  if (event.touches.length !== 2) return;

  twoFingerTapCount += 1;
  if (twoFingerTapTimer) {
    clearTimeout(twoFingerTapTimer);
    twoFingerTapTimer = null;
  }

  if (twoFingerTapCount >= 2) {
    toggleDevMenu();
    twoFingerTapCount = 0;
    return;
  }

  twoFingerTapTimer = window.setTimeout(() => {
    twoFingerTapCount = 0;
    twoFingerTapTimer = null;
  }, 350);
}

function handleDevKeydown(event) {
  if (event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (typeof event.key !== 'string') return;
  if (event.key.toLowerCase() !== 'd') return;
  toggleDevMenu();
}

function toggleDevMenu(force) {
  if (!devMenu) return;
  twoFingerTapCount = 0;
  if (twoFingerTapTimer) {
    clearTimeout(twoFingerTapTimer);
    twoFingerTapTimer = null;
  }
  const shouldShow = typeof force === 'boolean' ? force : devMenu.hidden;
  devMenu.hidden = !shouldShow;
}

function hideDevMenu() {
  if (!devMenu || devMenu.hidden) return;
  devMenu.hidden = true;
  twoFingerTapCount = 0;
  if (twoFingerTapTimer) {
    clearTimeout(twoFingerTapTimer);
    twoFingerTapTimer = null;
  }
}
