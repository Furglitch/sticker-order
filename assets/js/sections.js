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
  const list     = document.getElementById('sections-list');
  const idx      = sections.indexOf(sec);
  const letter   = sectionLetter(idx);
  const accentIdx = idx % ACCENT_COUNT;

  const el = document.createElement('div');
  el.className      = 'section-block';
  el.dataset.sid    = sec.id;
  el.dataset.accent = accentIdx;

  el.innerHTML = `
    <div class="section-head">
      <span class="section-letter">${letter}</span>
      <input class="section-label-input" type="text"
        placeholder="Section name (e.g. Casual, Silly, Reactions…)"
        value="${escHtml(sec.label)}"
        oninput="updateSectionLabel(${sec.id}, this.value)">
      <div class="section-actions">
        <button class="icon-btn" title="Move section up"   onclick="moveSection(${sec.id},-1)">↑</button>
        <button class="icon-btn" title="Move section down" onclick="moveSection(${sec.id}, 1)">↓</button>
        <button class="icon-btn danger" title="Delete section" onclick="deleteSection(${sec.id})">✕</button>
      </div>
    </div>
    <div class="section-body">
      <div class="sticker-list" id="slist-${sec.id}"></div>
      <div class="add-sticker-row">
        <button class="btn btn-accent btn-sm" onclick="addSticker(${sec.id})">＋ Add Sticker</button>
      </div>
    </div>
  `;

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
    const ph = document.createElement('div');
    ph.className = 'section-empty';
    ph.textContent = 'No stickers in this section yet.';
    list.appendChild(ph);
  }
}