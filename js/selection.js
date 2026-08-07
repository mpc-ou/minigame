// selection.js - Xu ly tap tung o, dam bao chon lien tuc dung 1 huong
// Neu doi huong -> huy lua chon cu, o vua click thanh diem bat dau moi

export function createSelectionManager() {
  let selectedCells = []; // [{row, col}]
  let lockedDir = null;   // {dr, dc} huong hien tai (null neu chua co 2 o)

  function getDirection(a, b) {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);
    return { dr, dc };
  }

  function isAdjacentInDir(last, next, dir) {
    return next.row === last.row + dir.dr && next.col === last.col + dir.dc;
  }

  // Tra ve { selection, reset } - reset=true neu vua huy chon truoc do
  function tapCell(cell) {
    if (selectedCells.length === 0) {
      selectedCells = [cell];
      lockedDir = null;
      return { selection: [...selectedCells], reset: false };
    }

    if (selectedCells.length === 1) {
      const first = selectedCells[0];
      if (first.row === cell.row && first.col === cell.col) {
        return { selection: [...selectedCells], reset: false };
      }
      const dir = getDirection(first, cell);
      // Kiem tra cell co thang hang voi first theo dung 1 huong trong 8 huong khong
      const rowDiff = cell.row - first.row;
      const colDiff = cell.col - first.col;
      const isStraightLine =
        rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff);

      if (!isStraightLine) {
        // Khong thang hang -> huy chon, bat dau lai tu o moi
        selectedCells = [cell];
        lockedDir = null;
        return { selection: [...selectedCells], reset: true };
      }

      // Sinh ra day o giua first va cell theo dir
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const path = [];
      for (let i = 0; i <= steps; i++) {
        path.push({ row: first.row + dir.dr * i, col: first.col + dir.dc * i });
      }
      selectedCells = path;
      lockedDir = dir;
      return { selection: [...selectedCells], reset: false };
    }

    // Da co >= 2 o, kiem tra cell co noi tiep dung huong khong
    const last = selectedCells[selectedCells.length - 1];
    if (isAdjacentInDir(last, cell, lockedDir)) {
      selectedCells.push(cell);
      return { selection: [...selectedCells], reset: false };
    }

    // Doi huong -> huy chon cu, cell la diem bat dau moi
    selectedCells = [cell];
    lockedDir = null;
    return { selection: [...selectedCells], reset: true };
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