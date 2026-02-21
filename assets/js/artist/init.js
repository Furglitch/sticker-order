(function () {
  loadState();
  renderAll();

  document.getElementById('import-input').addEventListener('change', e => {
    Array.from(e.target.files).forEach(importCommission);
    e.target.value = '';
  });

  (function () {
    const saved = localStorage.getItem('stickerBriefTheme');
    const theme = saved === 'latte' ? 'latte' : 'mocha';
    document.documentElement.setAttribute('data-theme', theme);
  })();
})();