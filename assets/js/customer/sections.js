function addSection(data = {}) {
  const id = uid();
  const sec = {
    id,
    label:    data.label    || '',
    stickers: data.stickers ? data.stickers.map(s => ({ ...s, id: uid() })) : [],
  };
  sections.push(sec);
  renderSection(sec);
  updateCountBadge();
  if (!data.label) {
    setTimeout(() => {
      const el = document.querySelector(`.section-block[data-sid="${id}"] .section-label-input`);
      if (el) el.focus();
    }, 40);
  }
}

function renderSection(sec) {
  const list      = document.getElementById('sections-list');
  const idx       = sections.indexOf(sec);
  const accentIdx = idx % ACCENT_COUNT;

  const el = document.getElementById('tmpl-section').content.cloneNode(true).firstElementChild;
  el.dataset.sid    = sec.id;
  el.dataset.accent = accentIdx;

  el.querySelector('.section-letter').textContent = sectionLetter(idx);

  const labelInput = el.querySelector('.section-label-input');
  labelInput.value = sec.label;
  labelInput.addEventListener('input', () => updateSectionLabel(sec.id, labelInput.value));

  const btns = el.querySelectorAll('.section-actions .icon-btn');
  btns[0].addEventListener('click', () => moveSection(sec.id, -1));
  btns[1].addEventListener('click', () => moveSection(sec.id,  1));
  btns[2].addEventListener('click', () => deleteSection(sec.id));

  el.querySelector('.sticker-list').id = `slist-${sec.id}`;
  el.querySelector('.add-sticker-row .btn').addEventListener('click', () => addSticker(sec.id));

  list.appendChild(el);
  sec.stickers.forEach(s => renderStickerCard(sec.id, s));
  refreshSectionEmptyState(sec.id);
}

function reRenderAll() {
  document.getElementById('sections-list').innerHTML = '';
  sections.forEach(s => renderSection(s));
  updateCountBadge();
}

function updateSectionLabel(sid, val) {
  const sec = sections.find(s => s.id === sid);
  if (sec) sec.label = val;
}

function moveSection(sid, dir) {
  const i  = sections.findIndex(s => s.id === sid);
  const ni = i + dir;
  if (ni < 0 || ni >= sections.length) return;
  [sections[i], sections[ni]] = [sections[ni], sections[i]];
  reRenderAll();
}

function deleteSection(sid) {
  const sec = sections.find(s => s.id === sid);
  const hasStickers = sec && sec.stickers.length > 0;
  if (hasStickers && !confirm(`Delete this section and its ${sec.stickers.length} sticker(s)?`)) return;
  sections = sections.filter(s => s.id !== sid);
  const el = document.querySelector(`.section-block[data-sid="${sid}"]`);
  if (el) el.remove();
  updateCountBadge();
}

function refreshSectionEmptyState(sid) {
  const sec  = sections.find(s => s.id === sid);
  const list = document.getElementById(`slist-${sid}`);
  if (!sec || !list) return;
  const old = list.querySelector('.section-empty');
  if (old) old.remove();
  if (sec.stickers.length === 0) {
    list.appendChild(document.getElementById('tmpl-section-empty').content.cloneNode(true));
  }
}