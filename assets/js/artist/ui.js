function renderAll() {
  renderSidebar();
  renderRatesPanel();
  renderCommissionView();
}


function renderSidebar() {
  const list        = document.getElementById('commission-list');
  const sideEmpty   = document.getElementById('sidebar-empty');
  const commissions = Object.values(artistData.commissions)
    .sort((a, b) => a.importedAt.localeCompare(b.importedAt));

  if (!commissions.length) {
    list.innerHTML   = '';
    sideEmpty.hidden = false;
    return;
  }
  sideEmpty.hidden = true;

  list.innerHTML = commissions.map(c => {
    const stickers = c.sections.flatMap(s => s.stickers);
    const total    = stickers.length;
    const done     = stickers.filter(s => s.done).length;
    const pct      = total ? Math.round((done / total) * 100) : 0;
    const active   = c.id === artistData.activeId;

    return `<div class="sidebar-item ${active ? 'active' : ''}" onclick="setActiveCommission('${c.id}')">
      <div class="sidebar-item-header">
        <span class="sidebar-name">${escArtist(c.meta?.packName || 'Untitled')}</span>
        <button class="icon-btn danger sidebar-del" title="Remove" onclick="event.stopPropagation(); deleteCommission('${c.id}')">✕</button>
      </div>
      <div class="sidebar-char">${escArtist(c.meta?.character || '')}</div>
      <div class="sidebar-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${done}/${total}</span>
      </div>
    </div>`;
  }).join('');
}


function renderStats() {
  const comm = activeCommission();
  const bar  = document.getElementById('stats-bar');
  if (!comm) { bar.innerHTML = ''; return; }

  const stickers = comm.sections.flatMap(s => s.stickers);
  const total    = stickers.length;
  const done     = stickers.filter(s => s.done).length;

  const standard = stickers.filter(s => !s.nsfw && !s.ych && !s.multiChar).length;

  const nsfwOnlyCounts = {};
  stickers.filter(s => s.nsfw && !s.ych && !s.multiChar).forEach(s => {
    const n = s.nsfwCharCount || 1;
    nsfwOnlyCounts[n] = (nsfwOnlyCounts[n] || 0) + 1;
  });

  const ychOnlyCounts = {};
  stickers.filter(s => s.ych && !s.nsfw && !s.multiChar).forEach(s => {
    const n = s.ychCount || 1;
    ychOnlyCounts[n] = (ychOnlyCounts[n] || 0) + 1;
  });

  const multiOnlyCounts = {};
  stickers.filter(s => s.multiChar && !s.nsfw && !s.ych).forEach(s => {
    const n = s.charCount || 1;
    multiOnlyCounts[n] = (multiOnlyCounts[n] || 0) + 1;
  });

  const nsfwYchCounts = {};
  stickers.filter(s => s.nsfw && s.ych && !s.multiChar).forEach(s => {
    const key = `${s.nsfwCharCount || 1}_${s.ychCount || 1}`;
    nsfwYchCounts[key] = (nsfwYchCounts[key] || 0) + 1;
  });
  const nsfwYchTotal = Object.values(nsfwYchCounts).reduce((a, b) => a + b, 0);

  const nsfwMultiCounts = {};
  stickers.filter(s => s.nsfw && s.multiChar && !s.ych).forEach(s => {
    const key = `${s.nsfwCharCount || 1}_${s.charCount || 1}`;
    nsfwMultiCounts[key] = (nsfwMultiCounts[key] || 0) + 1;
  });
  const nsfwMultiTotal = Object.values(nsfwMultiCounts).reduce((a, b) => a + b, 0);

  const ychMultiCounts = {};
  stickers.filter(s => s.ych && s.multiChar && !s.nsfw).forEach(s => {
    const key = `${s.ychCount || 1}_${s.charCount || 1}`;
    ychMultiCounts[key] = (ychMultiCounts[key] || 0) + 1;
  });
  const ychMultiTotal = Object.values(ychMultiCounts).reduce((a, b) => a + b, 0);

  const allThreeCounts = {};
  stickers.filter(s => s.nsfw && s.ych && s.multiChar).forEach(s => {
    const key = `${s.nsfwCharCount || 1}_${s.ychCount || 1}_${s.charCount || 1}`;
    allThreeCounts[key] = (allThreeCounts[key] || 0) + 1;
  });
  const allThreeTotal = Object.values(allThreeCounts).reduce((a, b) => a + b, 0);

  const pct = total ? Math.round((done / total) * 100) : 0;

  const pill = (label, count, color) =>
    count > 0 ? `<div class="stat-pill" style="--pill-color:var(--${color})">
      <span class="stat-label">${label}</span>
      <span class="stat-count">${count}</span>
    </div>` : '';

  const nsfwPills = Object.entries(nsfwOnlyCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`NSFW ${n}×`, count, 'red'))
    .join('');

  const ychPills = Object.entries(ychOnlyCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`YCH ${n}×`, count, 'blue'))
    .join('');

  const multiPills = Object.entries(multiOnlyCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`Add ${n}×`, count, 'green'))
    .join('');

  const nsfwYchPills = Object.entries(nsfwYchCounts)
    .sort(([a],[b]) => { const [an,am]=a.split('_').map(Number),[bn,bm]=b.split('_').map(Number); return an-bn||am-bm; })
    .map(([key, count]) => { const [nsfwN,ychN]=key.split('_'); return pill(`NSFW ${nsfwN}× + YCH ${ychN}×`, count, 'maroon'); })
    .join('');

  const nsfwMultiPills = Object.entries(nsfwMultiCounts)
    .sort(([a],[b]) => { const [an,am]=a.split('_').map(Number),[bn,bm]=b.split('_').map(Number); return an-bn||am-bm; })
    .map(([key, count]) => { const [nsfwN,multiN]=key.split('_'); return pill(`NSFW ${nsfwN}× + Add ${multiN}×`, count, 'mauve'); })
    .join('');

  const ychMultiPills = Object.entries(ychMultiCounts)
    .sort(([a],[b]) => { const [an,am]=a.split('_').map(Number),[bn,bm]=b.split('_').map(Number); return an-bn||am-bm; })
    .map(([key, count]) => { const [ychN,multiN]=key.split('_'); return pill(`YCH ${ychN}× + Add ${multiN}×`, count, 'teal'); })
    .join('');

  const allThreePills = Object.entries(allThreeCounts)
    .sort(([a],[b]) => { const [an,am,ak]=a.split('_').map(Number),[bn,bm,bk]=b.split('_').map(Number); return an-bn||am-bm||ak-bk; })
    .map(([key, count]) => { const [nsfwN,ychN,multiN]=key.split('_'); return pill(`NSFW ${nsfwN}× + YCH ${ychN}× + Add ${multiN}×`, count, 'flamingo'); })
    .join('');

  const nsfwOnlyTotal = Object.values(nsfwOnlyCounts).reduce((a, b) => a + b, 0);
  const ychOnlyTotal  = Object.values(ychOnlyCounts).reduce((a, b) => a + b, 0);
  const multiOnlyTotal = Object.values(multiOnlyCounts).reduce((a, b) => a + b, 0);
  const isEmpty = !standard && !nsfwOnlyTotal && !ychOnlyTotal && !multiOnlyTotal
                  && !nsfwYchTotal && !nsfwMultiTotal && !ychMultiTotal && !allThreeTotal;

  const hasRates = hasAnyRates();
  let totalHTML = '';
  if (hasRates) {
    const orderTotal = stickers.reduce((sum, s) => sum + calcStickerPrice(s), 0);
    totalHTML = `<div class="stats-total">
      <span>Est. Total</span>
      <span class="stats-total-amount">$${orderTotal.toFixed(2)}</span>
    </div>`;
  }

  bar.innerHTML = `
    <div class="stats-progress">
      <span class="stats-done-label">${done}/${total} done</span>
      <div class="stats-progress-bar">
        <div class="stats-progress-fill" style="width:${pct}%"></div>
      </div>
      <span class="stats-pct">${pct}%</span>
    </div>
    <div class="stat-pills">
      ${pill('Standard', standard, 'overlay2')}
      ${nsfwPills}
      ${ychPills}
      ${multiPills}
      ${nsfwYchPills}
      ${nsfwMultiPills}
      ${ychMultiPills}
      ${allThreePills}
      ${isEmpty ? '<span style="color:var(--overlay0);font-size:0.82rem;font-style:italic;">No flags set.</span>' : ''}
    </div>
    ${totalHTML}`;

  comm.sections.forEach(sec => {
    const el = document.getElementById(`sec-price-${sec.id}`);
    if (!el) return;
    el.textContent = hasRates ? `$${calcSectionTotal(sec).toFixed(2)}` : '';
  });
}


function renderCommissionView() {
  const comm    = activeCommission();
  const main    = document.getElementById('commission-main');
  const empty   = document.getElementById('main-empty');
  const title   = document.getElementById('commission-title');

  if (!comm) {
    main.style.display  = 'none';
    empty.style.display = 'block';
    title.textContent   = 'Artist Dashboard';
    renderStats();
    return;
  }

  main.style.display  = 'block';
  empty.style.display = 'none';
  title.textContent   = comm.meta?.packName || 'Untitled Commission';

  renderStats();
  renderMetaBlock(comm);
  renderSections(comm);
}

function renderMetaBlock(comm) {
  const el = document.getElementById('meta-block');
  const m  = comm.meta || {};

  const block = document.getElementById('tmpl-meta-block').content.cloneNode(true).firstElementChild;

  const setRow = (key, val) => {
    const row = block.querySelector(`[data-meta="${key}"]`);
    if (!row) return;
    if (!val) { row.remove(); return; }
    row.querySelector('.meta-row-val').textContent = val;
  };

  setRow('username',  m.username);
  setRow('character', m.character);
  setRow('desc',      m.desc);
  setRow('notes',     m.notes);

  const charImages = m.charImages || [];
  if (!charImages.length) {
    block.querySelector('[data-meta="charImages"]').remove();
  } else {
    const strip = block.querySelector('.thumb-strip');
    charImages.forEach(img => {
      const imgEl     = document.createElement('img');
      imgEl.src       = img.dataUrl;
      imgEl.className = 'meta-thumb';
      imgEl.alt       = escArtist(img.name);
      imgEl.addEventListener('click', () => openArtistLightbox(encodeURIComponent(img.dataUrl)));
      strip.appendChild(imgEl);
    });
  }

  block.querySelector('[data-meta="importedAt"] .meta-row-val').textContent =
    new Date(comm.importedAt).toLocaleDateString();

  el.innerHTML = '';
  el.appendChild(block);
}

function renderSections(comm) {
  const container = document.getElementById('sections-container');
  container.innerHTML = '';

  const ACCENT_COLORS = ['--peach','--blue','--green','--mauve','--teal','--flamingo','--yellow','--lavender'];

  comm.sections.forEach((sec, si) => {
    const letter    = sectionLetterArtist(si);
    const accentVar = ACCENT_COLORS[si % ACCENT_COLORS.length];
    const total     = sec.stickers.length;
    const done      = sec.stickers.filter(s => s.done).length;
    const secPrice  = hasAnyRates() ? `$${calcSectionTotal(sec).toFixed(2)}` : '';

    const secEl = document.getElementById('tmpl-artist-section').content.cloneNode(true).firstElementChild;
    secEl.style.setProperty('--accent', `var(${accentVar})`);
    secEl.style.borderLeftColor = `var(${accentVar})`;

    const letterEl = secEl.querySelector('.section-letter');
    letterEl.style.color = `var(${accentVar})`;
    letterEl.textContent = letter;

    secEl.querySelector('.artist-section-name').innerHTML =
      escArtist(sec.label) || '<em style="opacity:.5">Untitled Section</em>';
    secEl.querySelector('.section-done-badge').textContent = `${done}/${total}`;

    const priceTag = secEl.querySelector('.section-price-tag');
    priceTag.id          = `sec-price-${sec.id}`;
    priceTag.textContent = secPrice;

    const cardList = secEl.querySelector('.artist-card-list');
    cardList.id = `seclist-${sec.id}`;

    container.appendChild(secEl);
    sec.stickers.forEach(s => cardList.appendChild(buildStickerCard(comm.id, sec.id, s)));
  });
}


function buildStickerCard(commId, sid, sticker) {
  const card = document.getElementById('tmpl-artist-card').content.cloneNode(true).firstElementChild;
  if (sticker.done) card.classList.add('is-done');
  card.dataset.cid = sticker.id;

  const doneCheck = card.querySelector('.done-checkbox');
  doneCheck.checked = sticker.done;
  doneCheck.addEventListener('change', () => toggleDone(commId, sid, sticker.id));

  const titleEl = card.querySelector('.artist-card-num');
  titleEl.innerHTML = escArtist(sticker.title) || '<em style="opacity:.5">Untitled</em>';

  const tagsEl = card.querySelector('.tag-pills-header');
  tagsEl.id        = `tags-${sticker.id}`;
  tagsEl.innerHTML = buildTagPills(sticker);

  const fieldData = [
    ['emotion', sticker.emotion],
    ['pose',    sticker.pose],
    ['notes',   sticker.notes],
  ];
  fieldData.forEach(([key, val]) => {
    const row = card.querySelector(`[data-field="${key}"]`);
    if (!val) { row.remove(); return; }
    row.querySelector('.field-row-val').textContent = val;
  });

  const imgsHTML = (sticker.images || []).map(img =>
    `<img src="${img.dataUrl}" class="ref-thumb" alt="${escArtist(img.name)}">`
  ).join('');
  if (imgsHTML) {
    const refsDiv     = document.createElement('div');
    refsDiv.className = 'artist-card-refs';
    refsDiv.innerHTML = imgsHTML;
    refsDiv.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', () => openArtistLightbox(encodeURIComponent(img.src)));
    });
    card.querySelector('.artist-card-body').appendChild(refsDiv);
  }

  const flagItems  = card.querySelectorAll('.flag-item');
  const countWraps = card.querySelectorAll('.char-count-wrap');
  const flagSetup  = [
    { field: 'nsfw',      countField: 'nsfwCharCount', val: sticker.nsfw,      count: sticker.nsfwCharCount || 1 },
    { field: 'ych',       countField: 'ychCount',      val: sticker.ych,       count: sticker.ychCount      || 1 },
    { field: 'multiChar', countField: 'charCount',     val: sticker.multiChar, count: sticker.charCount     || 1 },
  ];
  flagSetup.forEach(({ field, countField, val, count }, i) => {
    const label    = flagItems[i];
    const wrap     = countWraps[i];
    const checkbox = label.querySelector('input[type="checkbox"]');
    const numInput = wrap.querySelector('input[type="number"]');
    checkbox.checked = !!val;
    numInput.value   = count;
    if (val) { label.classList.add('active'); wrap.classList.add('visible'); }
    checkbox.addEventListener('change', () => setFlag(commId, sid, sticker.id, field, checkbox.checked));
    numInput.addEventListener('input',  () => setFlag(commId, sid, sticker.id, countField, +numInput.value));
  });

  const notesTA = card.querySelector('.artist-notes-input');
  notesTA.value = sticker.artistNotes || '';
  notesTA.addEventListener('input', () => setArtistNotes(commId, sid, sticker.id, notesTA.value));

  return card;
}

function buildTagPills(sticker) {
  const pills = [];
  if (sticker.nsfw) {
    const n = sticker.nsfwCharCount || 1;
    pills.push(`<span class="tag-pill tag-nsfw">NSFW ${n}×</span>`);
  }
  if (sticker.ych) {
    const n = sticker.ychCount || 1;
    pills.push(`<span class="tag-pill tag-ych">YCH ${n}×</span>`);
  }
  if (sticker.multiChar) {
    const n = sticker.charCount || 1;
    pills.push(`<span class="tag-pill tag-multi">+${n}×</span>`);
  }
  return pills.join('');
}

function renderTagPills(card, commId, sid, cid) {
  const comm = artistData.commissions[commId];
  if (!comm) return;
  const sec = comm.sections.find(s => s.id === sid);
  if (!sec) return;
  const sticker = sec.stickers.find(s => s.id === cid);
  if (!sticker) return;
  const el = card.querySelector(`#tags-${cid}`);
  if (el) el.innerHTML = buildTagPills(sticker);
}


function openArtistLightbox(encodedSrc) {
  document.getElementById('artist-lightbox-img').src = decodeURIComponent(encodedSrc);
  document.getElementById('artist-lightbox').classList.add('open');
}

function closeArtistLightbox() {
  document.getElementById('artist-lightbox').classList.remove('open');
  document.getElementById('artist-lightbox-img').src = '';
}


function showArtistToast(msg) {
  const t = document.getElementById('artist-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}


function calcStickerPrice(sticker) {
  const r = artistData.rates || {};
  let price = parseFloat(r.base) || 0;
  if (sticker.nsfw) {
    const nsfwChars = r.nsfwMode === 'per-char'
      ? Math.max(sticker.nsfwCharCount || 1, 1)
      : 1;
    price += nsfwChars * (parseFloat(r.nsfw) || 0);
  }
  if (sticker.ych)       price += Math.max(sticker.ychCount || 1, 1) * (parseFloat(r.ych) || 0);
  if (sticker.multiChar) price += Math.max(sticker.charCount || 1, 1) * (parseFloat(r.multiChar) || 0);
  return price;
}

function calcSectionTotal(sec) {
  return (sec.stickers || []).reduce((sum, s) => sum + calcStickerPrice(s), 0);
}

function hasAnyRates() {
  const r = artistData.rates || {};
  return (parseFloat(r.base) || 0) + (parseFloat(r.nsfw) || 0) +
         (parseFloat(r.multiChar) || 0) + (parseFloat(r.ych) || 0) > 0;
}


function escArtist(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function sectionLetterArtist(i) {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (i < 26) return L[i];
  return L[Math.floor(i / 26) - 1] + L[i % 26];
}


function toggleSidebar() {
  document.getElementById('artist-sidebar').classList.toggle('open');
}


function renderRatesPanel() {
  const el = document.getElementById('rates-modal-body');
  if (!el) return;
  const r = artistData.rates || {};
  const val = key => (r[key] > 0 ? r[key] : '');

  const infoIcon = tip => `<span class="rate-info" aria-label="${tip}">
    <span class="rate-info-icon">i</span>
    <span class="rate-tooltip">${tip}</span>
  </span>`;

  const rateInput = (key, label, tip = '') => `
    <div class="rate-row">
      <label class="rate-label">${label}${tip ? infoIcon(tip) : ''}</label>
      <div class="rate-input-wrap">
        <span class="rate-currency">$</span>
        <input class="rate-input" type="number" min="0" step="0.01" placeholder="0.00"
          value="${val(key)}"
          oninput="setRate('${key}', this.value)">
      </div>
    </div>`;

  const nsfwMode = (r.nsfwMode || 'flat');
  const nsfwRow = `
    <div class="rate-row">
      <div class="rate-label-group">
        <span class="rate-label">NSFW ${infoIcon(
          nsfwMode === 'per-char'
            ? 'Per Char: Charged for every NSFW character in the sticker.'
            : 'Flat: Charged once per sticker, regardless of character count.'
        )}</span>
        <div class="nsfw-mode-toggle">
          <button class="nsfw-mode-btn${nsfwMode === 'flat'     ? ' active' : ''}" onclick="setNsfwMode('flat')">Flat</button>
          <button class="nsfw-mode-btn${nsfwMode === 'per-char' ? ' active' : ''}" onclick="setNsfwMode('per-char')">Per Char</button>
        </div>
      </div>
      <div class="rate-input-wrap">
        <span class="rate-currency">$</span>
        <input class="rate-input" type="number" min="0" step="0.01" placeholder="0.00"
          value="${val('nsfw')}"
          oninput="setRate('nsfw', this.value)">
      </div>
    </div>`;

  el.innerHTML = `
    ${rateInput('base', 'Base per-sticker', 'Charged once for every sticker in the order, before any upcharges.')}
    <div class="rates-subsection">
      <span class="rates-subsection-label">Upcharges</span>
      ${rateInput('multiChar', 'Additional Character', 'Charged per extra character.')}
      ${rateInput('ych',       'YCH',                  'Charged per YCH character. Does not stack with Additional Character upcharge.')}
      ${nsfwRow}
    </div>`;
}

function openRatesModal() {
  renderRatesPanel();
  document.getElementById('rates-modal-overlay').classList.add('open');
}

function closeRatesModal(e) {
  if (e && e.target !== document.getElementById('rates-modal-overlay')) return;
  document.getElementById('rates-modal-overlay').classList.remove('open');
}