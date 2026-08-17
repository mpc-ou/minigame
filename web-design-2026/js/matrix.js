// matrix.js - Sinh ma tran 8x8 va dat 5 tu khoa theo 8 huong
// Thuat toan: Randomized placement + Backtracking gioi han so lan thu
// Do phuc tap: trung binh O(K * A * N) voi K = so tu khoa, A = so lan thu, N = do dai tu
// (rat nhanh voi N=8, K=5 -> chay tuc thi tren moi thiet bi)

import { GRID_SIZE, KEYWORDS, DIRECTIONS, MAX_PLACEMENT_ATTEMPTS, MAX_MATRIX_REGENERATE } from './config.js';
import { randomLetter, randomInt } from './utils.js';

function createEmptyGrid() { //tao ma tran 8x8 ban dau, moi o chua null (chua co chu cai nao)
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function canPlace(grid, word, row, col, dir) { //kiem tra xem co the dat tu word vao ma tran grid tai vi tri (row, col) theo huong dir khong
  const cells = [];
  for (let i = 0; i < word.length; i++) { //duyet tung ky tu trong tu word
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null; //neu vuot ra ngoai ma tran, tra ve null (khong the dat tu)
    const existing = grid[r][c];
    // Cho phep overlap CHI KHI chu cai trung khop, khong cho de sai
    if (existing !== null && existing !== word[i]) return null; //neu o da co chu cai khac voi chu cai tuong ung trong word, tra ve null (khong the dat tu)
    cells.push({ r, c });
  }
  return cells; //tra ve danh sach cac o (row, col) neu co the dat tu, neu khong tra ve null
}

function placeWord(grid, word) { //dat tu word vao ma tran grid
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const dir = DIRECTIONS[randomInt(DIRECTIONS.length)]; //chon ngau nhien 1 huong trong 8 huong
    const row = randomInt(GRID_SIZE);
    const col = randomInt(GRID_SIZE);
    const cells = canPlace(grid, word, row, col, dir);
    if (cells) {
      cells.forEach((cell, i) => {
        grid[cell.r][cell.c] = word[i]; //dat chu cai tuong ung vao ma tran grid tai cac o (row, col) trong danh sach cells
      });
      return cells; //tra ve danh sach cac o (row, col) da dat tu word
    }
  }
  return null; // that bai sau MAX_PLACEMENT_ATTEMPTS lan thu
}

function fillRandomLetters(grid) { //duyet tung o trong ma tran grid, neu o chua co chu cai (null) thi dat 1 chu cai ngau nhien tu ALPHABET
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) grid[r][c] = randomLetter();
    }
  }
}

// Tra ve { grid, placements } - placements: { word: [{r,c}, ...] }
export function generateMatrix() { //backtracking: thu dat tu theo thu tu dai nhat truoc, neu that bai thi regenerate toan bo ma tran
  for (let regen = 0; regen < MAX_MATRIX_REGENERATE; regen++) {
    const grid = createEmptyGrid();
    const placements = {};
    let success = true;

    // Dat tu dai nhat truoc de giam kha nang bi ket cho tu ngan
    const sortedWords = [...KEYWORDS].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      const cells = placeWord(grid, word);
      if (!cells) {
        success = false;
        break;
      }
      placements[word] = cells;
    }

    if (success) {
      fillRandomLetters(grid);
      return { grid, placements };
    }
  }
  throw new Error('Không thể sinh ma trận sau nhiều lần thử. Hãy kiểm tra lại danh sách từ khóa.');
}