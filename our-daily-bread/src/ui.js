const statusEl = document.getElementById('status');
const habitEl = document.getElementById('habit-cta');
const shareBtn = document.getElementById('share');
const shareContainer = document.querySelector('.share-actions');
const shareDefaultLabel = shareBtn ? (shareBtn.textContent || 'Share results') : 'Share results';
const footerEl = document.querySelector('.app-footer');
let shareMessage = '';
let shareResetTimer = null;
let resetAction = null;
let resetPending = false;
let lastFooterTapTime = 0;
const DOUBLE_TAP_WINDOW = 320;

export function wireUI({ onReset, onSolve }) {
  resetAction = (typeof onReset === 'function') ? onReset : null;

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

  if (footerEl) {
    footerEl.addEventListener('touchend', handleFooterTouchEnd, { passive: true });
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
  if (!shareMessage) {
    shareBtn.tabIndex = -1;
  } else {
    shareBtn.tabIndex = 0;
  }
  if (shareContainer) {
    const isVisible = Boolean(shareMessage);
    shareContainer.hidden = !isVisible;
    shareContainer.classList.toggle('is-visible', isVisible);
  }
}

function handleFooterTouchEnd(event) {
  if (!event || !resetAction || resetPending) return;
  if (event.touches && event.touches.length > 0) return;
  if (event.changedTouches && event.changedTouches.length !== 1) return;
  const now = Date.now();
  const sinceLast = now - lastFooterTapTime;
  if (sinceLast > 40 && sinceLast <= DOUBLE_TAP_WINDOW) {
    triggerReset();
    lastFooterTapTime = 0;
  } else {
    lastFooterTapTime = now;
  }
}

function triggerReset() {
  if (!resetAction || resetPending) return;
  const result = resetAction();
  if (result && typeof result.then === 'function') {
    resetPending = true;
    result.finally(() => {
      resetPending = false;
    });
  }
}
