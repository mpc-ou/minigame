import { DIRECTIONS } from './config.js';

export function createSelectionManager() {
  let selectedCells = [];
  let lockedDir = null;

  function getDirection(a, b) {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);
    return { dr, dc };
  }

  function isAllowedDirection(dir) {
    return DIRECTIONS.some((d) => d.dr === dir.dr && d.dc === dir.dc);
  }

  function isAdjacentInDir(last, next, dir) {
    return next.row === last.row + dir.dr && next.col === last.col + dir.dc;
  }

  function tapCell(cell) {
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
      const rowDiff = cell.row - first.row;
      const colDiff = cell.col - first.col;
      const isStraightLine =
        rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff);

      if (!isStraightLine || !isAllowedDirection(dir)) {
        selectedCells = [cell];
        lockedDir = null;
        return [...selectedCells];
      }

      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const path = [];
      for (let i = 0; i <= steps; i++) {
        path.push({ row: first.row + dir.dr * i, col: first.col + dir.dc * i });
      }
      selectedCells = path;
      lockedDir = dir;
      return [...selectedCells];
    }

    const last = selectedCells[selectedCells.length - 1];
    if (isAdjacentInDir(last, cell, lockedDir)) {
      selectedCells.push(cell);
      return [...selectedCells];
    }

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