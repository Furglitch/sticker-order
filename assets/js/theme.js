function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'latte' ? 'mocha' : 'latte');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stickerOrderSheetTheme', theme);
}

(function () {
  const saved = localStorage.getItem('stickerOrderSheetTheme');
  setTheme(saved === 'latte' ? 'latte' : 'mocha');
})();