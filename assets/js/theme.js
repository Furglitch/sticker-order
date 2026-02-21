function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'latte' ? 'mocha' : 'latte');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stickerBriefTheme', theme);
}

// Restore saved preference (or fall back to Mocha).
(function () {
  const saved = localStorage.getItem('stickerBriefTheme');
  setTheme(saved === 'latte' ? 'latte' : 'mocha');
})();