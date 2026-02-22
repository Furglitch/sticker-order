function readImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => callback({ name: file.name, dataUrl: e.target.result });
  reader.readAsDataURL(file);
}

function addThumb(containerId, imgObj, imgIdx, onRemove) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const wrap = document.createElement('div');
  wrap.className = 'thumb-wrap';
  wrap.dataset.imgIdx = imgIdx;
  const img = document.createElement('img');
  img.src   = imgObj.dataUrl;
  img.alt   = imgObj.name;
  img.title = imgObj.name;
  img.onclick = ev => { ev.stopPropagation(); openLightbox(imgObj.dataUrl); };
  const btn = document.createElement('button');
  btn.className = 'thumb-remove';
  btn.textContent = '✕';
  btn.title = 'Remove image';
  btn.onclick = ev => { ev.stopPropagation(); onRemove(wrap, imgIdx); };
  wrap.appendChild(img);
  wrap.appendChild(btn);
  container.appendChild(wrap);
}

function reIndexThumbs(containerId, updateFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  Array.from(container.children).forEach((el, i) => {
    el.dataset.imgIdx = i;
    updateFn(el, i);
  });
}

function updateDropZoneHint(dropId, count) {
  const zone = document.getElementById(dropId);
  if (!zone) return;
  if (count > 0) {
    zone.querySelector('.drop-hint').textContent = 'Add more images';
    zone.style.minHeight = '44px';
    zone.style.padding   = '8px 14px';
  } else {
    zone.querySelector('.drop-hint').textContent =
      dropId === 'char-drop' ? 'Click or drag general references here' : 'Click or drag images here';
    zone.style.minHeight = '80px';
    zone.style.padding   = '14px';
  }
}

function onDragOver(e, id) {
  e.preventDefault();
  const el = document.getElementById(id === 'char' ? 'char-drop' : `drop-${id}`);
  if (el) el.classList.add('drag-over');
}

function onDragLeave(e, id) {
  const el = document.getElementById(id === 'char' ? 'char-drop' : `drop-${id}`);
  if (el) el.classList.remove('drag-over');
}

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-img').src = '';
}

function triggerCharImageInput() {
  document.getElementById('char-img-input').click();
}

function handleCharImageInput(e) {
  Array.from(e.target.files).forEach(f => readImageFile(f, img => {
    charImages.push(img);
    addThumb('char-thumbs', img, charImages.length - 1,
      (wrapEl, imgIdx) => removeCharImage(imgIdx, wrapEl)
    );
    updateDropZoneHint('char-drop', charImages.length);
  }));
  e.target.value = '';
}

function removeCharImage(imgIdx, wrapEl) {
  charImages.splice(imgIdx, 1);
  wrapEl.remove();
  reIndexThumbs('char-thumbs', (el, i) => {
    el.querySelector('.thumb-remove').onclick = ev => { ev.stopPropagation(); removeCharImage(i, el); };
  });
  updateDropZoneHint('char-drop', charImages.length);
}

function onDropChar(e) {
  e.preventDefault();
  document.getElementById('char-drop').classList.remove('drag-over');
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(f => readImageFile(f, img => {
      charImages.push(img);
      addThumb('char-thumbs', img, charImages.length - 1,
        (wrapEl, imgIdx) => removeCharImage(imgIdx, wrapEl)
      );
      updateDropZoneHint('char-drop', charImages.length);
    }));
}

function triggerStickerImageInput(cid) {
  document.getElementById(`img-input-${cid}`).click();
}

function handleStickerImageInput(e, sid, cid) {
  Array.from(e.target.files).forEach(f => readImageFile(f, img => addStickerImage(sid, cid, img)));
  e.target.value = '';
}

function addStickerImage(sid, cid, img) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const sticker = sec.stickers.find(x => x.id === cid);
  if (!sticker) return;
  sticker.images.push(img);
  addThumb(`thumbs-${cid}`, img, sticker.images.length - 1,
    (wrapEl, imgIdx) => removeStickerImage(sid, cid, imgIdx, wrapEl)
  );
  updateDropZoneHint(`drop-${cid}`, sticker.images.length);
}

function removeStickerImage(sid, cid, imgIdx, wrapEl) {
  const sec = sections.find(s => s.id === sid);
  if (!sec) return;
  const sticker = sec.stickers.find(x => x.id === cid);
  if (!sticker) return;
  sticker.images.splice(imgIdx, 1);
  wrapEl.remove();
  reIndexThumbs(`thumbs-${cid}`, (el, i) => {
    el.querySelector('.thumb-remove').onclick = ev => { ev.stopPropagation(); removeStickerImage(sid, cid, i, el); };
  });
  updateDropZoneHint(`drop-${cid}`, sticker.images.length);
}

function onDrop(e, sid, cid) {
  e.preventDefault();
  document.getElementById(`drop-${cid}`).classList.remove('drag-over');
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(f => readImageFile(f, img => addStickerImage(sid, cid, img)));
}

function addImageFromUrl(sid, cid, url) {
  url = url.trim();
  if (!url) return;
  const name = url.split('/').pop().split('?')[0] || 'image';
  addStickerImage(sid, cid, { name, dataUrl: url });
}

function addCharImageFromUrl(url) {
  url = url.trim();
  if (!url) return;
  const name = url.split('/').pop().split('?')[0] || 'image';
  const img = { name, dataUrl: url };
  charImages.push(img);
  addThumb('char-thumbs', img, charImages.length - 1,
    (wrapEl, imgIdx) => removeCharImage(imgIdx, wrapEl)
  );
  updateDropZoneHint('char-drop', charImages.length);
}