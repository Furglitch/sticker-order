function addSticker(sid, data = {}) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const id = uid();
  const sticker = {
    id,
    title:     data.title     || '',
    emotion:   data.emotion   || '',
    pose:      data.pose      || '',
    notes:     data.notes     || '',
    images:    data.images    || [],
    nsfw:          data.nsfw          || false,
    nsfwCharCount: data.nsfwCharCount || 1,
    ych:           data.ych           || false,
    ychCount:      data.ychCount      || 1,
    multiChar:     data.multiChar     || false,
    charCount:     data.charCount     || 1,
  };
  sec.stickers.push(sticker);
  renderStickerCard(sid, sticker);
  refreshSectionEmptyState(sid);
  updateCountBadge();
  if (!data.title) {
    setTimeout(() => {
      const el = document.querySelector(`.sticker-card[data-cid="${id}"] .card-title-input`);
      if (el) el.focus();
    }, 40);
  }
}

function renderStickerCard(sid, sticker) {
  const sec  = sections.find(s => s.id === sid);
  const list = document.getElementById(`slist-${sid}`);
  if (!sec || !list) return;

  const ph = list.querySelector('.section-empty');
  if (ph) ph.remove();

  const idx  = sec.stickers.indexOf(sticker) + 1;
  const card = document.getElementById('tmpl-sticker-card').content.cloneNode(true).firstElementChild;
  card.dataset.cid = sticker.id;

  card.querySelector('.card-num').textContent = idx;

  const titleInput = card.querySelector('.card-title-input');
  titleInput.value = sticker.title;
  titleInput.addEventListener('input', () => updateStickerField(sid, sticker.id, 'title', titleInput.value));

  const fieldInputs = card.querySelectorAll('.card-fields .field input');
  const notesTA     = card.querySelector('.card-fields .field textarea');

  fieldInputs[0].value = sticker.emotion;
  fieldInputs[0].addEventListener('input', () => updateStickerField(sid, sticker.id, 'emotion', fieldInputs[0].value));

  fieldInputs[1].value = sticker.pose;
  fieldInputs[1].addEventListener('input', () => updateStickerField(sid, sticker.id, 'pose', fieldInputs[1].value));

  notesTA.value = sticker.notes;
  notesTA.addEventListener('input', () => updateStickerField(sid, sticker.id, 'notes', notesTA.value));

  const actionBtns = card.querySelectorAll('.card-actions .icon-btn');
  actionBtns[0].addEventListener('click', () => moveSticker(sid, sticker.id, -1));
  actionBtns[1].addEventListener('click', () => moveSticker(sid, sticker.id,  1));
  actionBtns[2].addEventListener('click', () => deleteSticker(sid, sticker.id));

  const dropZone = card.querySelector('.image-drop-zone');
  dropZone.id = `drop-${sticker.id}`;
  dropZone.addEventListener('click',     () => triggerStickerImageInput(sticker.id));
  dropZone.addEventListener('dragover',  e  => onDragOver(e, sticker.id));
  dropZone.addEventListener('dragleave', e  => onDragLeave(e, sticker.id));
  dropZone.addEventListener('drop',      e  => onDrop(e, sid, sticker.id));

  const urlInput = card.querySelector('.url-image-input');
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && urlInput.value.trim()) {
      addImageFromUrl(sid, sticker.id, urlInput.value);
      urlInput.value = '';
    }
  });

  const urlAddBtn = card.querySelector('.url-add-btn');
  urlAddBtn.addEventListener('click', () => {
    if (urlInput.value.trim()) { addImageFromUrl(sid, sticker.id, urlInput.value); urlInput.value = ''; }
  });

  card.querySelector('.image-thumbnails').id = `thumbs-${sticker.id}`;

  const fileInput = card.querySelector('input[type="file"]');
  fileInput.id = `img-input-${sticker.id}`;
  fileInput.addEventListener('change', e => handleStickerImageInput(e, sid, sticker.id));

  const flagItems  = card.querySelectorAll('.flag-item');
  const countWraps = card.querySelectorAll('.char-count-wrap');
  const flagSetup  = [
    { wrapId: `nsfwcount-${sticker.id}`, inputId: `nsfwinput-${sticker.id}`, field: 'nsfw',      countField: 'nsfwCharCount', val: sticker.nsfw,      count: sticker.nsfwCharCount || 1 },
    { wrapId: `ychcount-${sticker.id}`,  inputId: `ychinput-${sticker.id}`,  field: 'ych',       countField: 'ychCount',      val: sticker.ych,       count: sticker.ychCount      || 1 },
    { wrapId: `charcount-${sticker.id}`, inputId: `charinput-${sticker.id}`, field: 'multiChar', countField: 'charCount',     val: sticker.multiChar, count: sticker.charCount     || 1 },
  ];

  flagSetup.forEach(({ wrapId, inputId, field, countField, val, count }, i) => {
    const label    = flagItems[i];
    const wrap     = countWraps[i];
    const checkbox = label.querySelector('input[type="checkbox"]');
    const numInput = wrap.querySelector('input[type="number"]');
    wrap.id     = wrapId;
    numInput.id = inputId;
    wrap.querySelector('label').setAttribute('for', inputId);
    checkbox.checked = !!val;
    numInput.value   = count;
    if (val) { label.classList.add('active'); wrap.classList.add('visible'); }
    checkbox.addEventListener('change', () => updateStickerFlag(sid, sticker.id, field, checkbox.checked));
    numInput.addEventListener('input',  () => updateStickerField(sid, sticker.id, countField, +numInput.value));
  });

  list.appendChild(card);
  sticker.images.forEach((img, i) => addThumb(`thumbs-${sticker.id}`, img, i,
    (wrapEl, imgIdx) => removeStickerImage(sid, sticker.id, imgIdx, wrapEl)
  ));
  updateDropZoneHint(`drop-${sticker.id}`, sticker.images.length);
}

function reRenderSection(sid) {
  const sec  = sections.find(s => s.id === sid);
  const list = document.getElementById(`slist-${sid}`);
  if (!sec || !list) return;
  list.innerHTML = '';
  sec.stickers.forEach(s => renderStickerCard(sid, s));
  refreshSectionEmptyState(sid);
}

function updateStickerField(sid, cid, field, value) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const s = sec.stickers.find(x => x.id === cid);
  if (s) s[field] = value;
}

function updateStickerFlag(sid, cid, flag, val) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const s = sec.stickers.find(x => x.id === cid);
  if (!s) return;
  s[flag] = val;

  const card = document.querySelector(`.sticker-card[data-cid="${cid}"]`);
  if (!card) return;
  const labelMap = { nsfw: 'flag-nsfw', ych: 'flag-ych', multiChar: 'flag-multi' };
  const label = card.querySelector('.' + labelMap[flag]);
  if (label) label.classList.toggle('active', val);
  if (flag === 'nsfw') {
    const wrap = document.getElementById(`nsfwcount-${cid}`);
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      s.nsfwCharCount = 1;
      const input = wrap?.querySelector('input[type="number"]');
      if (input) input.value = '1';
    }
  }
  if (flag === 'ych') {
    const wrap = document.getElementById(`ychcount-${cid}`);
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      s.ychCount = 1;
      const input = wrap?.querySelector('input[type="number"]');
      if (input) input.value = '1';
    }
  }
  if (flag === 'multiChar') {
    const wrap = document.getElementById(`charcount-${cid}`);
    if (wrap) wrap.classList.toggle('visible', val);
    if (!val) {
      s.charCount = 1;
      const input = wrap?.querySelector('input[type="number"]');
      if (input) input.value = '1';
    }
  }
}

function moveSticker(sid, cid, dir) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const i  = sec.stickers.findIndex(x => x.id === cid);
  const ni = i + dir;
  if (ni < 0 || ni >= sec.stickers.length) return;
  [sec.stickers[i], sec.stickers[ni]] = [sec.stickers[ni], sec.stickers[i]];
  reRenderSection(sid);
}

function deleteSticker(sid, cid) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  sec.stickers = sec.stickers.filter(x => x.id !== cid);
  reRenderSection(sid);
  refreshSectionEmptyState(sid);
  updateCountBadge();
}