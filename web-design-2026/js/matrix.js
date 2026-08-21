import { GRID_SIZE, DIRECTIONS, MAX_PLACEMENT_ATTEMPTS, MAX_MATRIX_REGENERATE, selectRandomKeywords } from './config.js';
import { randomLetter, randomInt } from './utils.js';

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function canPlace(grid, word, row, col, dir) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return null;
    cells.push({ r, c });
  }
  return cells;
}

function placeWord(grid, word) {
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const dir = DIRECTIONS[randomInt(DIRECTIONS.length)];
    const row = randomInt(GRID_SIZE);
    const col = randomInt(GRID_SIZE);
    const cells = canPlace(grid, word, row, col, dir);
    if (cells) {
      cells.forEach((cell, i) => {
        grid[cell.r][cell.c] = word[i];
      });
      return cells;
    }
  }
  return null;
}

function fillRandomLetters(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) grid[r][c] = randomLetter();
    }
  }
}

export function generateMatrix(keywordItems = null) {
  const items = keywordItems && keywordItems.length > 0 ? keywordItems : selectRandomKeywords();
  const words = items.map((it) => (typeof it === 'string' ? it.trim().toUpperCase() : it.keyword.trim().toUpperCase()));

  for (let regen = 0; regen < MAX_MATRIX_REGENERATE; regen++) {
    const grid = createEmptyGrid();
    const placements = {};
    let success = true;

    const sortedWords = [...words].sort((a, b) => b.length - a.length);

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
      return { grid, placements, keywords: items };
    }
  }
  throw new Error('Không thể sinh ma trận sau nhiều lần thử. Hãy kiểm tra lại danh sách từ khóa.');
}