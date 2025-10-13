const statusEl = document.getElementById('status');

export function wireUI({ onReset, onSolve }) {
  const resetBtn = document.getElementById('reset');
  if (resetBtn && typeof onReset === 'function') {
    resetBtn.addEventListener('click', onReset);
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
}

export function setMovesUI(n) {
  document.getElementById('moves').textContent = String(n);
}

export function showSolved(n) {
  if (!statusEl) return;
  statusEl.textContent = `Solved in ${n} moves! 🎉`;
  statusEl.classList.add('is-solved');
}

export function resetSolvedUI() {
  if (!statusEl) return;
  statusEl.textContent = '';
  statusEl.classList.remove('is-solved');
}
