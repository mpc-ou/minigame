// config.js - Hang so toan cuc, khong chua logic

export const GRID_SIZE = 8; //Kích thước ma trận (8x8)

export const KEYWORDS = ['HTML', 'COLOR', 'LAYOUT', 'BUTTON', 'DESIGN']; //5 từ khóa cố định, 
// thứ tự trong mảng này sẽ quyết định thứ tự hiển thị trong danh sách từ khóa trên giao diện.

export const COMPETITION_NAME = 'WEB-DESIGN 2026';

// Chi 4 huong doc xuoi tu tren-trai xuong duoi-phai (khong cho doc nguoc)
export const DIRECTIONS = [
  { dr: 0, dc: 1 },   // trai -> phai
  { dr: 1, dc: 0 },   // tren -> duoi
  { dr: 1, dc: 1 },   // cheo xuong-phai
  { dr: 1, dc: -1 },  // cheo xuong-trai
];

export const STORAGE_KEY = 'webdesign2026_wordsearch_state'; //key duy nhất dùng khi lưu vào localStorage

export const MAX_PLACEMENT_ATTEMPTS = 200; // so lan thu dat 1 tu truoc khi coi la that bai
export const MAX_MATRIX_REGENERATE = 50;   // so lan regenerate toan bo ma tran

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// He thong goi y theo thoi gian: cu HINT_INTERVAL_MS troi qua ma con tu chua
// tim duoc thi tu dong che 40-50% ky tu ngau nhien cua 1 tu ngau nhien de goi y
export const HINT_INTERVAL_MS = 30000;
export const HINT_MASK_MIN_RATIO = 0.4;
export const HINT_MASK_MAX_RATIO = 0.5;