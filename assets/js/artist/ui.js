function renderAll() {
  renderSidebar();
  renderRatesPanel();
  renderCommissionView();
}


function renderSidebar() {
  const list = document.getElementById('commission-list');
  const commissions = Object.values(artistData.commissions)
    .sort((a, b) => a.importedAt.localeCompare(b.importedAt));

  if (!commissions.length) {
    list.innerHTML = `<div class="sidebar-empty">
      <span style="font-size:2rem;">📭</span>
      <p>No commissions yet.<br>Import a Sticker Order Sheet to get started.</p>
    </div>`;
    return;
  }

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

  // Flag counts — each flag is independent; a sticker can appear in multiple buckets
  const standard = stickers.filter(s => !s.nsfw && !s.ych && !s.multiChar).length;

  // ALL NSFW stickers, grouped by nsfwCharCount (includes combos)
  const nsfwOnlyCounts = {};
  stickers.filter(s => s.nsfw).forEach(s => {
    const n = s.nsfwCharCount || 1;
    nsfwOnlyCounts[n] = (nsfwOnlyCounts[n] || 0) + 1;
  });

  // ALL YCH stickers, grouped by ychCount (includes combos)
  const ychOnlyCounts = {};
  stickers.filter(s => s.ych).forEach(s => {
    const n = s.ychCount || 1;
    ychOnlyCounts[n] = (ychOnlyCounts[n] || 0) + 1;
  });

  // ALL multiChar stickers, grouped by charCount (includes combos)
  const multiOnlyCounts = {};
  stickers.filter(s => s.multiChar).forEach(s => {
    const n = s.charCount || 1;
    multiOnlyCounts[n] = (multiOnlyCounts[n] || 0) + 1;
  });

  // NSFW+YCH (no multiChar)
  const nsfwYch = stickers.filter(s => s.nsfw && s.ych && !s.multiChar).length;

  // NSFW+Add (no YCH), grouped by charCount
  const nsfwMultiCounts = {};
  stickers.filter(s => s.nsfw && s.multiChar && !s.ych).forEach(s => {
    const n = s.charCount || 1;
    nsfwMultiCounts[n] = (nsfwMultiCounts[n] || 0) + 1;
  });
  const nsfwMultiTotal = Object.values(nsfwMultiCounts).reduce((a, b) => a + b, 0);

  // YCH+Add (no NSFW), grouped by charCount
  const ychMultiCounts = {};
  stickers.filter(s => s.ych && s.multiChar && !s.nsfw).forEach(s => {
    const n = s.charCount || 1;
    ychMultiCounts[n] = (ychMultiCounts[n] || 0) + 1;
  });
  const ychMultiTotal = Object.values(ychMultiCounts).reduce((a, b) => a + b, 0);

  // All three flags, grouped by charCount
  const allThreeCounts = {};
  stickers.filter(s => s.nsfw && s.ych && s.multiChar).forEach(s => {
    const n = s.charCount || 1;
    allThreeCounts[n] = (allThreeCounts[n] || 0) + 1;
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

  const nsfwMultiPills = Object.entries(nsfwMultiCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`NSFW+Add ${n}×`, count, 'mauve'))
    .join('');

  const ychMultiPills = Object.entries(ychMultiCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`YCH+Add ${n}×`, count, 'teal'))
    .join('');

  const allThreePills = Object.entries(allThreeCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`All 3 ${n}×`, count, 'flamingo'))
    .join('');

  const nsfwOnlyTotal = Object.values(nsfwOnlyCounts).reduce((a, b) => a + b, 0);
  const ychOnlyTotal  = Object.values(ychOnlyCounts).reduce((a, b) => a + b, 0);
  const multiOnlyTotal = Object.values(multiOnlyCounts).reduce((a, b) => a + b, 0);
  const isEmpty = !standard && !nsfwOnlyTotal && !ychOnlyTotal && !multiOnlyTotal
                  && !nsfwYch && !nsfwMultiTotal && !ychMultiTotal && !allThreeTotal;

  // Pricing total
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
      ${pill('NSFW+YCH', nsfwYch, 'maroon')}
      ${nsfwMultiPills}
      ${ychMultiPills}
      ${allThreePills}
      ${isEmpty ? '<span style="color:var(--overlay0);font-size:0.82rem;font-style:italic;">No flags set.</span>' : ''}
    </div>
    ${totalHTML}`;

  // Update per-section price tags
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

  const row = (label, val) => val
    ? `<div class="meta-row"><span class="meta-row-label">${label}</span><span class="meta-row-val">${escArtist(val)}</span></div>`
    : '';

  const charImgHTML = (m.charImages || []).length
    ? `<div class="meta-row meta-row-images">
        <span class="meta-row-label">Character Refs</span>
        <div class="thumb-strip">${(m.charImages).map(img =>
          `<img src="${img.dataUrl}" class="meta-thumb" alt="${escArtist(img.name)}" onclick="openArtistLightbox('${encodeURIComponent(img.dataUrl)}')">`
        ).join('')}</div>
      </div>`
    : '';

  el.innerHTML = `
    <div class="meta-block panel">
      <h2 class="block-heading">📋 Pack Details</h2>
      ${row('Username', m.username)}
      ${row('Character', m.character)}
      ${row('Description', m.desc)}
      ${row('Style', m.style)}
      ${row('Notes', m.notes)}
      ${charImgHTML}
      <div class="meta-row"><span class="meta-row-label">Imported</span>
        <span class="meta-row-val">${new Date(comm.importedAt).toLocaleDateString()}</span>
      </div>
    </div>`;
}

function renderSections(comm) {
  const container = document.getElementById('sections-container');
  container.innerHTML = '';

  const ACCENT_COLORS = ['--peach','--blue','--green','--mauve','--teal','--flamingo','--yellow','--lavender'];

  comm.sections.forEach((sec, si) => {
    const letter     = sectionLetterArtist(si);
    const accentVar  = ACCENT_COLORS[si % ACCENT_COLORS.length];
    const total      = sec.stickers.length;
    const done       = sec.stickers.filter(s => s.done).length;

    const secEl = document.createElement('div');
    secEl.className = 'artist-section';
    secEl.style.setProperty('--accent', `var(${accentVar})`);
    secEl.style.borderLeftColor = `var(${accentVar})`;

    const secPrice = hasAnyRates() ? `$${calcSectionTotal(sec).toFixed(2)}` : '';

    secEl.innerHTML = `
      <div class="artist-section-head">
        <span class="section-letter" style="color:var(${accentVar})">${letter}</span>
        <span class="artist-section-name">${escArtist(sec.label) || '<em style="opacity:.5">Untitled Section</em>'}</span>
        <span class="section-done-badge">${done}/${total}</span>
        <span class="section-price-tag" id="sec-price-${sec.id}">${secPrice}</span>
      </div>
      <div class="artist-card-list" id="seclist-${sec.id}"></div>`;

    container.appendChild(secEl);

    sec.stickers.forEach(s => {
      const card = buildStickerCard(comm.id, sec.id, s);
      document.getElementById(`seclist-${sec.id}`).appendChild(card);
    });
  });
}


function buildStickerCard(commId, sid, sticker) {
  const card = document.createElement('div');
  card.className = `artist-card${sticker.done ? ' is-done' : ''}`;
  card.dataset.cid = sticker.id;

  const tagHTML = buildTagPills(sticker);

  const imgsHTML = (sticker.images || []).map(img =>
    `<img src="${img.dataUrl}" class="ref-thumb" alt="${escArtist(img.name)}"
      onclick="openArtistLightbox('${encodeURIComponent(img.dataUrl)}')">`
  ).join('');

  const fieldRow = (label, val) => val
    ? `<div class="card-field-row"><span class="field-row-label">${label}</span><span class="field-row-val">${escArtist(val)}</span></div>`
    : '';

  card.innerHTML = `
    <div class="artist-card-header">
      <label class="done-toggle" title="Mark as done">
        <input type="checkbox" class="done-checkbox" ${sticker.done ? 'checked' : ''}
          onchange="toggleDone('${commId}',${sid},${sticker.id})">
        <span class="done-check-ui"></span>
      </label>
      <span class="artist-card-num">
        ${escArtist(sticker.title) || `<em style="opacity:.5">Untitled</em>`}
      </span>
      <div class="tag-pills-header" id="tags-${sticker.id}">${tagHTML}</div>
    </div>

    <div class="artist-card-body">
      <div class="artist-card-info">
        ${fieldRow('Expression', sticker.emotion)}
        ${fieldRow('Pose', sticker.pose)}
        ${fieldRow('Notes', sticker.notes)}
      </div>
      ${imgsHTML.length ? `<div class="artist-card-refs">${imgsHTML}</div>` : ''}
    </div>

    <div class="sticker-flags artist-flags">
      <label class="flag-item flag-nsfw${sticker.nsfw ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.nsfw ? 'checked' : ''}
          onchange="setFlag('${commId}',${sid},${sticker.id},'nsfw',this.checked)">
          <span class="sw-track"></span></span>
        NSFW
      </label>
      <div class="char-count-wrap${sticker.nsfw ? ' visible' : ''}" data-wrap="nsfw">
        <label>NSFW Chars:</label>
        <input class="char-count-input" type="number" min="1" max="99" value="${sticker.nsfwCharCount || 1}"
          oninput="setFlag('${commId}',${sid},${sticker.id},'nsfwCharCount',+this.value)">
      </div>
      <label class="flag-item flag-ych${sticker.ych ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.ych ? 'checked' : ''}
          onchange="setFlag('${commId}',${sid},${sticker.id},'ych',this.checked)">
          <span class="sw-track"></span></span>
        YCH
      </label>
      <div class="char-count-wrap${sticker.ych ? ' visible' : ''}" data-wrap="ych">
        <label>Slots:</label>
        <input class="char-count-input" type="number" min="1" max="99" value="${sticker.ychCount || 1}"
          oninput="setFlag('${commId}',${sid},${sticker.id},'ychCount',+this.value)">
      </div>
      <label class="flag-item flag-multi${sticker.multiChar ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.multiChar ? 'checked' : ''}
          onchange="setFlag('${commId}',${sid},${sticker.id},'multiChar',this.checked)">
          <span class="sw-track"></span></span>
        Additional Characters
      </label>
      <div class="char-count-wrap${sticker.multiChar ? ' visible' : ''}" data-wrap="multi">
        <label>Add. Chars:</label>
        <input class="char-count-input" type="number" min="1" max="99" value="${sticker.charCount || 1}"
          oninput="setFlag('${commId}',${sid},${sticker.id},'charCount',+this.value)">
      </div>
    </div>

    <div class="artist-notes-row">
      <label class="area-label">Artist Notes</label>
      <textarea class="artist-notes-input" placeholder="Your private notes for this sticker…"
        oninput="setArtistNotes('${commId}',${sid},${sticker.id},this.value)">${escArtist(sticker.artistNotes || '')}</textarea>
    </div>`;

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