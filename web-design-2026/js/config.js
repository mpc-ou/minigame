export const GRID_SIZE = 8;

export const KEYWORDS = ['HTML', 'COLOR', 'LAYOUT', 'BUTTON', 'DESIGN'];

export const GAME_NAME = 'Word Hunt Game';
export const COMPETITION_NAME = 'WEB-DESIGN 2026';
export const TOPIC = 'Chủ đề: Lập trình & Thiết kế Web';

export const DIRECTIONS = [
  { dr: 0, dc: 1 },   // trai -> phai
  { dr: 1, dc: 0 },   // tren -> duoi
  { dr: 1, dc: 1 },   // cheo xuong-phai
  // { dr: 1, dc: -1 },  // cheo xuong-trai
];

export const STORAGE_KEY = 'webdesign2026_wordsearch_state';

export const MAX_PLACEMENT_ATTEMPTS = 200;
export const MAX_MATRIX_REGENERATE = 50;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const HINT_INTERVAL_MS = 30000;
export const HINT_MASK_MIN_RATIO = 0.4;
export const HINT_MASK_MAX_RATIO = 0.5;

export const HINT_URGENT_THRESHOLD_S = 5;

export const GGFORM_URL = 'https://www.mpclub.dev';