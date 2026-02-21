const STORAGE_KEY = 'stickerArtistData';

let artistData = { activeId: null, commissions: {} };

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artistData));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) artistData = JSON.parse(raw);
  } catch {
    artistData = { activeId: null, commissions: {} };
  }
}

function activeCommission() {
  return artistData.activeId ? artistData.commissions[artistData.activeId] : null;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}