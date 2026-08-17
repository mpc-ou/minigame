import { ALPHABET, HINT_MASK_MIN_RATIO, HINT_MASK_MAX_RATIO } from './config.js';

export function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export function formatDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${min}:${s} ${d}/${m}/${y}`;
}

export function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(16).toUpperCase();
  return positive.padStart(6, '0').slice(0, 6);
}

export function cellKey(row, col) {
  return `${row}_${col}`;
}

export function maskWord(word) {
  const length = word.length;
  const ratio = HINT_MASK_MIN_RATIO + Math.random() * (HINT_MASK_MAX_RATIO - HINT_MASK_MIN_RATIO);
  const maskCount = Math.min(length - 1, Math.max(1, Math.round(length * ratio)));

  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const maskedSet = new Set(indices.slice(0, maskCount));

  return word
    .split('')
    .map((ch, i) => (maskedSet.has(i) ? '_' : ch))
    .join('');
}