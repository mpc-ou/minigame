// animation.js - Chi lo them/xoa class, khong chua logic game (dumb component)

export function markSelecting(el) {
  el.classList.add('cell-selecting');
}

export function clearSelecting(el) {
  el.classList.remove('cell-selecting');
}

export function markCorrect(el) {
  el.classList.remove('cell-selecting');
  el.classList.add('cell-correct');
  el.classList.add('cell-pulse');
  setTimeout(() => el.classList.remove('cell-pulse'), 500);
}

export function shakeInvalid(elements) {
  elements.forEach((el) => {
    el.classList.add('cell-invalid');
    setTimeout(() => el.classList.remove('cell-invalid'), 300);
  });
}

export function showVictoryDialog(dialogEl) {
  dialogEl.classList.remove('hidden');
  requestAnimationFrame(() => dialogEl.classList.add('show'));
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
}

export function hideVictoryDialog(dialogEl) {
  dialogEl.classList.remove('show');
  setTimeout(() => dialogEl.classList.add('hidden'), 250);
}