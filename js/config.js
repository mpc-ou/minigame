// config.js - Hang so toan cuc, khong chua logic

export const GRID_SIZE = 8; //Kích thước ma trận (8x8)

export const KEYWORDS = ['HTML', 'COLOR', 'LAYOUT', 'BUTTON', 'DESIGN']; //5 từ khóa cố định, 
// thứ tự trong mảng này sẽ quyết định thứ tự hiển thị trong danh sách từ khóa trên giao diện.

export const COMPETITION_NAME = 'WEB-DESIGN 2026';

// 8 huong: [dRow, dCol]
export const DIRECTIONS = [
  { dr: 0, dc: 1 },   // trai -> phai
  { dr: 0, dc: -1 },  // phai -> trai
  { dr: 1, dc: 0 },   // tren -> duoi
  { dr: -1, dc: 0 },  // duoi -> tren
  { dr: 1, dc: 1 },   // cheo tren-trai -> duoi-phai
  { dr: -1, dc: -1 }, // cheo duoi-phai -> tren-trai
  { dr: 1, dc: -1 },  // cheo tren-phai -> duoi-trai
  { dr: -1, dc: 1 },  // cheo duoi-trai -> tren-phai
];

export const STORAGE_KEY = 'webdesign2026_wordsearch_state'; //key duy nhất dùng khi lưu vào localStorage

export const MAX_PLACEMENT_ATTEMPTS = 200; // so lan thu dat 1 tu truoc khi coi la that bai
export const MAX_MATRIX_REGENERATE = 50;   // so lan regenerate toan bo ma tran

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';