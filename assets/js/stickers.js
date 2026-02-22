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
  const card = document.createElement('div');
  card.className = 'sticker-card';
  card.dataset.cid = sticker.id;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-num">${idx}</span>
      <input class="card-title-input" type="text"
        placeholder="Sticker name (e.g. Laughing, Sleepy, Heart Eyes…)"
        value="${escHtml(sticker.title)}"
        oninput="updateStickerField(${sid},${sticker.id},'title',this.value)">
      <div class="card-actions">
        <button class="icon-btn" title="Move up"   onclick="moveSticker(${sid},${sticker.id},-1)">↑</button>
        <button class="icon-btn" title="Move down" onclick="moveSticker(${sid},${sticker.id}, 1)">↓</button>
        <button class="icon-btn danger" title="Delete" onclick="deleteSticker(${sid},${sticker.id})">✕</button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-fields">
        <div class="field">
          <label>Expression / Emotion</label>
          <input type="text" placeholder="e.g. big silly grin, crying laughing"
            value="${escHtml(sticker.emotion)}"
            oninput="updateStickerField(${sid},${sticker.id},'emotion',this.value)">
        </div>
        <div class="field">
          <label>Pose / Action</label>
          <input type="text" placeholder="e.g. holding coffee, peace sign, waving"
            value="${escHtml(sticker.pose)}"
            oninput="updateStickerField(${sid},${sticker.id},'pose',this.value)">
        </div>
        <div class="field">
          <label>Extra Notes</label>
          <textarea placeholder="Text on sticker, background, accessories, special details…"
            oninput="updateStickerField(${sid},${sticker.id},'notes',this.value)">${escHtml(sticker.notes)}</textarea>
        </div>
      </div>
      <div>
        <div class="area-label">Reference Images</div>
        <div class="image-drop-zone" id="drop-${sticker.id}"
          onclick="triggerStickerImageInput(${sticker.id})"
          ondragover="onDragOver(event,${sticker.id})"
          ondragleave="onDragLeave(event,${sticker.id})"
          ondrop="onDrop(event,${sid},${sticker.id})">
          <span class="drop-icon">🖼</span>
          <span class="drop-hint">Click or drag images here</span>
        </div>
        <div class="url-input-row">
          <input class="url-image-input" type="url" placeholder="Or paste an image URL…"
            onkeydown="if(event.key==='Enter'&&this.value.trim()){addImageFromUrl(${sid},${sticker.id},this.value);this.value=''}">
          <button class="btn btn-sm url-add-btn" onclick="const i=this.previousElementSibling;if(i.value.trim()){addImageFromUrl(${sid},${sticker.id},i.value);i.value=''}">Add</button>
        </div>
        <div class="image-thumbnails" id="thumbs-${sticker.id}"></div>
        <input type="file" id="img-input-${sticker.id}" accept="image/*" multiple style="display:none"
          onchange="handleStickerImageInput(event,${sid},${sticker.id})">
      </div>
    </div>
    <div class="sticker-flags">
      <label class="flag-item flag-nsfw${sticker.nsfw ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.nsfw ? 'checked' : ''} onchange="updateStickerFlag(${sid},${sticker.id},'nsfw',this.checked)"><span class="sw-track"></span></span>
        NSFW
      </label>
      <div class="char-count-wrap${sticker.nsfw ? ' visible' : ''}" id="nsfwcount-${sticker.id}">
        <label for="nsfwinput-${sticker.id}">NSFW Chars:</label>
        <input class="char-count-input" id="nsfwinput-${sticker.id}" type="number" min="1" max="99" value="${sticker.nsfwCharCount || 1}"
          oninput="updateStickerField(${sid},${sticker.id},'nsfwCharCount',+this.value)">
      </div>
      <label class="flag-item flag-ych${sticker.ych ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.ych ? 'checked' : ''} onchange="updateStickerFlag(${sid},${sticker.id},'ych',this.checked)"><span class="sw-track"></span></span>
        YCH
      </label>
      <div class="char-count-wrap${sticker.ych ? ' visible' : ''}" id="ychcount-${sticker.id}">
        <label for="ychinput-${sticker.id}">Slots:</label>
        <input class="char-count-input" id="ychinput-${sticker.id}" type="number" min="1" max="99" value="${sticker.ychCount || 1}"
          oninput="updateStickerField(${sid},${sticker.id},'ychCount',+this.value)">
      </div>
      <label class="flag-item flag-multi${sticker.multiChar ? ' active' : ''}">
        <span class="sw"><input type="checkbox" ${sticker.multiChar ? 'checked' : ''} onchange="updateStickerFlag(${sid},${sticker.id},'multiChar',this.checked)"><span class="sw-track"></span></span>
        Additional Characters
      </label>
      <div class="char-count-wrap${sticker.multiChar ? ' visible' : ''}" id="charcount-${sticker.id}">
        <label for="charinput-${sticker.id}">Add. Chars:</label>
        <input class="char-count-input" id="charinput-${sticker.id}" type="number" min="1" max="99" value="${sticker.charCount}"
          oninput="updateStickerField(${sid},${sticker.id},'charCount',+this.value)">
      </div>
    </div>
  `;

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