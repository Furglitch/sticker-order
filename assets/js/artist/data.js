function importCommission(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.meta || !json.sections) throw new Error('Invalid Sticker Order Sheet format');

      const id = generateId();
      const sections = (json.sections || []).map(sec => ({
        ...sec,
        stickers: (sec.stickers || []).map(s => ({
          ...s,
          artistNotes: s.artistNotes || '',
          done:        s.done        || false,
        })),
      }));

      artistData.commissions[id] = {
        id,
        importedAt: new Date().toISOString(),
        meta: json.meta,
        sections,
      };
      artistData.activeId = id;
      saveState();
      renderAll();
      showArtistToast(`Imported "${json.meta.packName || 'Untitled'}"`);
    } catch (err) {
      showArtistToast('Error reading Sticker Order Sheet: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function deleteCommission(id) {
  const c = artistData.commissions[id];
  if (!c) return;
  const name = c.meta?.packName || 'this commission';
  if (!confirm(`Remove "${name}" from your dashboard? This cannot be undone.`)) return;
  delete artistData.commissions[id];
  if (artistData.activeId === id) {
    const remaining = Object.keys(artistData.commissions);
    artistData.activeId = remaining.length ? remaining[remaining.length - 1] : null;
  }
  saveState();
  renderAll();
}

function setActiveCommission(id) {
  artistData.activeId = id;
  saveState();
  renderCommissionView();
  renderSidebar();
}

function updateSticker(commId, sid, cid, patch) {
  const comm = artistData.commissions[commId];
  if (!comm) return;
  const sec = comm.sections.find(s => s.id === sid);
  if (!sec) return;
  const sticker = sec.stickers.find(s => s.id === cid);
  if (!sticker) return;
  Object.assign(sticker, patch);
  saveState();
}

function toggleDone(commId, sid, cid) {
  const comm = artistData.commissions[commId];
  if (!comm) return;
  const sec = comm.sections.find(s => s.id === sid);
  if (!sec) return;
  const sticker = sec.stickers.find(s => s.id === cid);
  if (!sticker) return;
  sticker.done = !sticker.done;
  saveState();
  const card = document.querySelector(`.artist-card[data-cid="${cid}"]`);
  if (card) {
    card.classList.toggle('is-done', sticker.done);
    const cb = card.querySelector('.done-checkbox');
    if (cb) cb.checked = sticker.done;
  }
  renderStats();
  renderSidebar();
}

function setFlag(commId, sid, cid, flag, val) {
  updateSticker(commId, sid, cid, { [flag]: val });

  renderStats();
  const card = document.querySelector(`.artist-card[data-cid="${cid}"]`);
  if (!card) return;
  const flagMap = { nsfw: 'flag-nsfw', ych: 'flag-ych', multiChar: 'flag-multi' };
  const lbl = flagMap[flag] ? card.querySelector('.' + flagMap[flag]) : null;
  if (lbl) lbl.classList.toggle('active', val);
  if (flag === 'nsfw') {
    const wrap = card.querySelector('[data-wrap="nsfw"]');
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      const comm = artistData.commissions[commId];
      if (comm) {
        const sec = comm.sections.find(s => s.id === sid);
        if (sec) {
          const sticker = sec.stickers.find(s => s.id === cid);
          if (sticker) {
            sticker.nsfwCharCount = 1;
            const input = wrap?.querySelector('input[type="number"]');
            if (input) input.value = '1';
            saveState();
          }
        }
      }
    }
  }
  if (flag === 'ych') {
    const wrap = card.querySelector('[data-wrap="ych"]');
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      const comm = artistData.commissions[commId];
      if (comm) {
        const sec = comm.sections.find(s => s.id === sid);
        if (sec) {
          const sticker = sec.stickers.find(s => s.id === cid);
          if (sticker) {
            sticker.ychCount = 1;
            const input = wrap?.querySelector('input[type="number"]');
            if (input) input.value = '1';
            saveState();
          }
        }
      }
    }
  }
  if (flag === 'multiChar') {
    const wrap = card.querySelector('[data-wrap="multi"]');
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      const comm = artistData.commissions[commId];
      if (comm) {
        const sec = comm.sections.find(s => s.id === sid);
        if (sec) {
          const sticker = sec.stickers.find(s => s.id === cid);
          if (sticker) {
            sticker.charCount = 1;
            const input = wrap?.querySelector('input[type="number"]');
            if (input) input.value = '1';
            saveState();
          }
        }
      }
    }
  }
  renderTagPills(card, commId, sid, cid);
}

function setArtistNotes(commId, sid, cid, text) {
  updateSticker(commId, sid, cid, { artistNotes: text });
}

function setRate(key, val) {
  if (!artistData.rates) artistData.rates = {};
  artistData.rates[key] = parseFloat(val) || 0;
  saveState();
  renderStats();
}

function setNsfwMode(mode) {
  if (!artistData.rates) artistData.rates = {};
  artistData.rates.nsfwMode = mode;
  saveState();
  renderRatesPanel();
  renderStats();
}