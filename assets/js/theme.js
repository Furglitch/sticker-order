function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'latte' ? 'mocha' : 'latte');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stickerBriefTheme', theme);
}

(function () {
  const saved = localStorage.getItem('stickerBriefTheme');
  setTheme(saved === 'latte' ? 'latte' : 'mocha');
})();