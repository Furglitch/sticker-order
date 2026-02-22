(function () {
  loadState();
  renderAll();

  document.getElementById('import-input').addEventListener('change', e => {
    Array.from(e.target.files).forEach(importCommission);
    e.target.value = '';
  });
})();