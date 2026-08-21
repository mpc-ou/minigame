import { STORAGE_KEY } from './config.js';

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Khong the luu trang thai:', e);
    return false;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Khong the doc trang thai:', e);
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialState() {
  return {
    fullName: '',
    studentId: '',
    startTime: Date.now(),
    winTime: null,
    isWin: false,
    keywords: [],
    foundKeywords: [],
    hintedWords: {},
    infoSubmitted: false,
    exported: false,
  };
}