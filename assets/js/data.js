function collectMeta() {
  return {
    packName:  document.getElementById('meta-packname').value,
    username:  document.getElementById('meta-username').value,
    character: document.getElementById('meta-character').value,
    desc:      document.getElementById('meta-desc').value,
    style:     document.getElementById('meta-style').value,
    notes:     document.getElementById('meta-notes').value,
    charImages,
  };
}

function exportJSON() {
  const data = { 
    meta: collectMeta(), 
    sections: sections.map(sec => ({
      ...sec,
      stickers: sec.stickers.map(s => {
        const sticker = { ...s };
        if (!sticker.multiChar) {
          delete sticker.charCount;
        }
        return sticker;
      })
    }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${slugify(data.meta.packName || 'sticker-order-sheet')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Draft saved!');
}

function importJSON() {
  document.getElementById('json-input').click();
}

function loadJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.meta) {
        document.getElementById('meta-packname').value  = data.meta.packName  || '';
        document.getElementById('meta-username').value  = data.meta.username  || '';
        document.getElementById('meta-character').value = data.meta.character || '';
        document.getElementById('meta-desc').value      = data.meta.desc      || '';
        document.getElementById('meta-style').value     = data.meta.style     || '';
        document.getElementById('meta-notes').value     = data.meta.notes     || '';
        charImages = [];
        document.getElementById('char-thumbs').innerHTML = '';
        (data.meta.charImages || []).forEach((img, i) => {
          charImages.push(img);
          addThumb('char-thumbs', img, i, (wrapEl, imgIdx) => removeCharImage(imgIdx, wrapEl));
        });
        updateDropZoneHint('char-drop', charImages.length);
      }
      sections = [];
      document.getElementById('sections-list').innerHTML = '';
      (data.sections || []).forEach(s => addSection(s));
      showToast('Draft loaded!');
    } catch {
      showToast('Error reading draft file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAll() {
  const total = sections.reduce((n, s) => n + s.stickers.length, 0);
  if ((sections.length || total) && !confirm('Reset the entire form? This cannot be undone.')) return;
  sections   = [];
  charImages = [];
  ['meta-packname', 'meta-username', 'meta-character', 'meta-desc', 'meta-style', 'meta-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('char-thumbs').innerHTML = '';
  updateDropZoneHint('char-drop', 0);
  reRenderAll();
}