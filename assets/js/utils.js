function uid() { return ++idCounter; }

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'brief';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function sectionLetter(i) {
  // A–Z, then AA, AB, …
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (i < 26) return L[i];
  return L[Math.floor(i / 26) - 1] + L[i % 26];
}

function updateCountBadge() {
  const total = sections.reduce((n, s) => n + s.stickers.length, 0);
  document.getElementById('count-badge').textContent = total;
  document.getElementById('empty-state').style.display = sections.length ? 'none' : 'block';
}