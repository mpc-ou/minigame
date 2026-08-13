// utils.js - Ham thuan tuy, dung chung cho toan bo du an
import { ALPHABET, HINT_MASK_MIN_RATIO, HINT_MASK_MAX_RATIO } from './config.js';

/*lấy 1 ký tự ngẫu nhiên từ bảng chữ cái ALPHABET (import từ config.js) — 
dùng để lấp đầy các ô trống trong ma trận.*/

export function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

//trả về số nguyên ngẫu nhiên từ 0 đến max - 1 — dùng khi thuật toán đặt từ chọn vị trí/hướng ngẫu nhiên.
export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

//định dạng thời gian kiểu HH:mm:ss dd/mm/yyyy, dùng khi hiển thị thời điểm hoàn thành trên ảnh xuất kết quả.
export function formatDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0'); //chuyển số thành chuỗi, nếu chuỗi đó ngắn hơn 2 ký tự thì thêm số 0 vào đầu cho đủ 2 ký tự.
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${min}:${s} ${d}/${m}/${y}`;//Dùng template literal (dấu backtick `) để ghép thành chuỗi cuối, ví dụ: 14:30:05 28/07/2026.
}

// Tao ma xac thuc ngan (khong phai hash bao mat, chi de doi chieu chong sua anh thu cong)
export function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);//trả về mã Unicode (một con số) của ký tự tại vị trí i. Ví dụ ký tự 'A' có mã là 65, 'a' là 97.
    hash = (hash << 5) - hash + chr; //hash << 5: dịch bit trái 5 vị trí, tương đương phép nhân với 32 (2^5 = 32). Đây là cách viết tối ưu tốc độ thay vì viết hash * 32.
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(16).toUpperCase();
  return positive.padStart(6, '0').slice(0, 6);
}

export function cellKey(row, col) {
  return `${row}_${col}`;
}

// Che ngau nhien 40-50% ky tu cua 1 tu bang dau "_", dung cho he thong goi y.
// Vi du: "BUTTON" -> "B_T_ON". Luon giu lai it nhat 1 ky tu khong bi che.
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