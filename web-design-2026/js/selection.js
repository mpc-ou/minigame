// selection.js - Xu ly tap tung o, dam bao chon lien tuc dung 1 huong
// Neu doi huong -> huy lua chon cu, o vua click thanh diem bat dau moi
import { DIRECTIONS } from './config.js';

export function createSelectionManager() {
  let selectedCells = []; // [{row, col}]
  let lockedDir = null;   // {dr, dc} huong hien tai (null neu chua co 2 o)

  function getDirection(a, b) {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);
    return { dr, dc };
  }

  // Tu khoa chi duoc dat theo 4 huong doc xuoi (xem config.js), nen o thu 2
  // nguoi choi tap cung chi duoc chap nhan neu nam dung 1 trong 4 huong do -
  // ngan chan hoan toan viec chon nguoc (phai->trai, duoi->tren, 2 huong cheo nguoc).
  function isAllowedDirection(dir) {
    return DIRECTIONS.some((d) => d.dr === dir.dr && d.dc === dir.dc);
  }

  function isAdjacentInDir(last, next, dir) {
    return next.row === last.row + dir.dr && next.col === last.col + dir.dc;
  }

  // Tra ve mang selection hien tai sau khi xu ly o vua tap
  function tapCell(cell) {
    // Tap lai 1 o da nam trong chuoi dang chon -> bo chon o do va toan bo
    // chuoi phia sau no (tap lai o dau tien = bo chon toan bo)
    const existingIndex = selectedCells.findIndex(
      (c) => c.row === cell.row && c.col === cell.col
    );
    if (existingIndex !== -1) {
      selectedCells = selectedCells.slice(0, existingIndex);
      if (selectedCells.length < 2) lockedDir = null;
      return [...selectedCells];
    }

    if (selectedCells.length === 0) {
      selectedCells = [cell];
      lockedDir = null;
      return [...selectedCells];
    }

    if (selectedCells.length === 1) {
      const first = selectedCells[0];
      const dir = getDirection(first, cell);
      // Kiem tra cell co thang hang voi first theo dung 1 huong trong 8 huong khong
      const rowDiff = cell.row - first.row;
      const colDiff = cell.col - first.col;
      const isStraightLine =
        rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff);

      if (!isStraightLine || !isAllowedDirection(dir)) {
        // Khong thang hang, hoac dung huong nhung la 1 trong 4 huong nguoc
        // bi cam -> huy chon, bat dau lai tu o moi
        selectedCells = [cell];
        lockedDir = null;
        return [...selectedCells];
      }

      // Sinh ra day o giua first va cell theo dir
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const path = [];
      for (let i = 0; i <= steps; i++) {
        path.push({ row: first.row + dir.dr * i, col: first.col + dir.dc * i });
      }
      selectedCells = path;
      lockedDir = dir;
      return [...selectedCells];
    }

    // Da co >= 2 o, kiem tra cell co noi tiep dung huong khong
    const last = selectedCells[selectedCells.length - 1];
    if (isAdjacentInDir(last, cell, lockedDir)) {
      selectedCells.push(cell);
      return [...selectedCells];
    }

    // Doi huong -> huy chon cu, cell la diem bat dau moi
    selectedCells = [cell];
    lockedDir = null;
    return [...selectedCells];
  }

  function reset() {
    selectedCells = [];
    lockedDir = null;
  }

  function getSelection() {
    return [...selectedCells];
  }

  return { tapCell, reset, getSelection };
}