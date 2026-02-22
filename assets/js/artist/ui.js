function renderAll() {
  renderSidebar();
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

  // Flag counts
  const standard = stickers.filter(s => !s.nsfw && !s.ych && !s.multiChar).length;
  const nsfw  = stickers.filter(s => s.nsfw && !s.ych && !s.multiChar).length;
  const ych   = stickers.filter(s => s.ych && !s.nsfw && !s.multiChar).length;
  const multi = stickers.filter(s => s.multiChar && !s.nsfw && !s.ych);

  // Multi-char breakdown by charCount
  const multiCounts = {};
  multi.forEach(s => {
    const n = s.charCount || 2;
    multiCounts[n] = (multiCounts[n] || 0) + 1;
  });

  // Combos
  const nsfwYch   = stickers.filter(s => s.nsfw  && s.ych && !s.multiChar).length;
  const nsfwMulti = stickers.filter(s => s.nsfw  && s.multiChar && !s.ych).length;
  const ychMulti  = stickers.filter(s => s.ych   && s.multiChar && !s.nsfw).length;

  // All three — broken down by charCount
  const allThreeCounts = {};
  stickers.filter(s => s.nsfw && s.ych && s.multiChar).forEach(s => {
    const n = s.charCount || 2;
    allThreeCounts[n] = (allThreeCounts[n] || 0) + 1;
  });
  const allThreeTotal = Object.values(allThreeCounts).reduce((a, b) => a + b, 0);

  const pct = total ? Math.round((done / total) * 100) : 0;

  const pill = (label, count, color) =>
    count > 0 ? `<div class="stat-pill" style="--pill-color:var(--${color})">
      <span class="stat-label">${label}</span>
      <span class="stat-count">${count}</span>
    </div>` : '';

  const multiPills = Object.entries(multiCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`${n}-char`, count, 'green'))
    .join('');

  const allThreePills = Object.entries(allThreeCounts)
    .sort(([a],[b]) => a - b)
    .map(([n, count]) => pill(`All three ${n}×`, count, 'flamingo'))
    .join('');

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
      ${pill('NSFW', nsfw, 'red')}
      ${pill('YCH', ych, 'blue')}
      ${multiPills}
      ${pill('NSFW+YCH', nsfwYch, 'maroon')}
      ${pill('NSFW+Multi', nsfwMulti, 'mauve')}
      ${pill('YCH+Multi', ychMulti, 'teal')}
      ${allThreePills}
      ${!standard && !nsfw && !ych && !multi.length && !nsfwYch && !nsfwMulti && !ychMulti && !allThreeTotal ? '<span style="color:var(--overlay0);font-size:0.82rem;font-style:italic;">No flags set.</span>' : ''}
    </div>`;
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

    secEl.innerHTML = `
      <div class="artist-section-head">
        <span class="section-letter" style="color:var(${accentVar})">${letter}</span>
        <span class="artist-section-name">${escArtist(sec.label) || '<em style="opacity:.5">Untitled Section</em>'}</span>
        <span class="section-done-badge">${done}/${total}</span>
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
      <label class="flag-item flag-ych${sticker.ych ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.ych ? 'checked' : ''}
          onchange="setFlag('${commId}',${sid},${sticker.id},'ych',this.checked)">
          <span class="sw-track"></span></span>
        YCH
      </label>
      <label class="flag-item flag-multi${sticker.multiChar ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.multiChar ? 'checked' : ''}
          onchange="setFlag('${commId}',${sid},${sticker.id},'multiChar',this.checked)">
          <span class="sw-track"></span></span>
        Multi-Character
      </label>
      <div class="char-count-wrap${sticker.multiChar ? ' visible' : ''}">
        <label>Characters:</label>
        <input class="char-count-input" type="number" min="2" max="99" value="${sticker.charCount || 2}"
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
  if (sticker.nsfw)      pills.push(`<span class="tag-pill tag-nsfw">NSFW</span>`);
  if (sticker.ych)       pills.push(`<span class="tag-pill tag-ych">YCH</span>`);
  if (sticker.multiChar) pills.push(`<span class="tag-pill tag-multi">${sticker.charCount || 2}×</span>`);
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