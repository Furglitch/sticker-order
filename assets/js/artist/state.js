const STORAGE_KEY = 'stickerArtistData';

let artistData = { activeId: null, commissions: {}, rates: { base: 0, nsfw: 0, nsfwMode: 'flat', multiChar: 0, ych: 0 } };

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artistData));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      artistData = JSON.parse(raw);
      if (!artistData.rates) artistData.rates = { base: 0, nsfw: 0, nsfwMode: 'flat', multiChar: 0, ych: 0 };
      if (!artistData.rates.nsfwMode) artistData.rates.nsfwMode = 'flat';
    }
  } catch {
    artistData = { activeId: null, commissions: {}, rates: { base: 0, nsfw: 0, nsfwMode: 'flat', multiChar: 0, ych: 0 } };
  }
}

function activeCommission() {
  return artistData.activeId ? artistData.commissions[artistData.activeId] : null;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}