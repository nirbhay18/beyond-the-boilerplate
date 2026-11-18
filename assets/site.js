// Shared helpers: copy-to-clipboard, toasts, and the red-flag bingo.
(function () {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let t;
  window.showToast = function (msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  window.copyText = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showToast('Copied to clipboard'); }
      catch (err) { showToast('Copy failed: select the text instead'); }
      ta.remove();
    }
  };

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.copy);
      if (el) copyText(el.innerText);
    });
  });

  // Red-flag bingo
  const board = document.querySelector('.bingo');
  if (board) {
    const cells = Array.from(board.querySelectorAll('button'));
    const status = document.querySelector('.bingo-status');
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const on = (i) => cells[i].classList.contains('free') || cells[i].getAttribute('aria-pressed') === 'true';
    const update = () => {
      const count = cells.filter((c) => !c.classList.contains('free') && c.getAttribute('aria-pressed') === 'true').length;
      const bingo = lines.some((l) => l.every(on));
      if (bingo) status.textContent = 'Bingo. Somebody owes a security patch. Start with the review checklist below.';
      else if (count) status.textContent = count + (count === 1 ? ' red flag' : ' red flags') + ' spotted.';
      else status.textContent = '';
    };
    cells.forEach((c) => {
      if (c.classList.contains('free')) return;
      c.setAttribute('aria-pressed', 'false');
      c.addEventListener('click', () => {
        c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        update();
      });
    });
  }
})();
