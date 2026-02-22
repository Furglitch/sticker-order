(function () {
  const sec = { id: uid(), label: '', stickers: [] };
  sections.push(sec);
  renderSection(sec);
  addSticker(sec.id, { skipFocus: true });
})();