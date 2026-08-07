// game.js - "Nhac truong": giu state, goi cac module khac
import { GRID_SIZE, KEYWORDS } from './config.js';
import { generateMatrix } from './matrix.js';
import { createSelectionManager } from './selection.js';
import { checkMatch } from './validator.js';
import { saveState, loadState } from './storage.js';
import * as anim from './animation.js';
import { exportResultImage } from './capture.js';

export function createGame({ dom, state }) {
  let grid = state.grid;
  let placements = state.placements;
  const foundKeywords = [...state.foundKeywords];
  let isReadOnly = state.isWin;

  const selectionMgr = createSelectionManager();
  const cellElements = []; // ma tran cac the div, cellElements[r][c]

  // O co the la diem giao nhau cua nhieu tu (VD: chu L cuoi cua HTML trung
  // chu L dau cua LAYOUT). Chi coi la "het viec" khi TAT CA cac tu di qua
  // o do da duoc tim thay, khong phai he 1 tu xong la khoa ca o.
  const cellWordsMap = {};
  Object.entries(placements).forEach(([word, cells]) => {
    cells.forEach(({ r, c }) => {
      const key = `${r}_${c}`;
      if (!cellWordsMap[key]) cellWordsMap[key] = [];
      cellWordsMap[key].push(word);
    });
  });

  function isCellFullyFound(row, col) {
    const words = cellWordsMap[`${row}_${col}`];
    if (!words) return false;
    return words.every((w) => foundKeywords.includes(w));
  }

  function persist() {
    saveState({
      ...state,
      foundKeywords,
      isWin: isReadOnly,
      grid,
      placements,
    });
  }

  function renderGrid() {
    dom.gridEl.innerHTML = '';
    dom.gridEl.style.setProperty('--grid-size', GRID_SIZE);
    for (let r = 0; r < GRID_SIZE; r++) {
      cellElements[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.textContent = grid[r][c];
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;
        cellEl.addEventListener('click', () => onCellClick(r, c, cellEl));
        dom.gridEl.appendChild(cellEl);
        cellElements[r][c] = cellEl;
      }
    }
  }

  function renderKeywordList() {
    dom.keywordListEl.innerHTML = '';
    KEYWORDS.forEach((word) => {
      const chip = document.createElement('span');
      chip.className = 'keyword-chip' + (foundKeywords.includes(word) ? ' found' : '');
      chip.textContent = word;
      dom.keywordListEl.appendChild(chip);
    });
  }

  function renderProgress() {
    dom.progressEl.textContent = `${foundKeywords.length}/${KEYWORDS.length}`;
  }

  function renderPlayerInfo() {
    dom.playerNameEl.textContent = state.fullName;
    dom.playerIdEl.textContent = `MSSV: ${state.studentId}`;
  }

  function lockFoundCells() {
    foundKeywords.forEach((word) => {
      const cells = placements[word];
      cells.forEach(({ r, c }) => {
        cellElements[r][c].classList.add('cell-correct');
        if (isCellFullyFound(r, c)) cellElements[r][c].classList.add('cell-locked');
      });
    });
  }

  function applyReadOnly() {
    dom.gridEl.classList.add('readonly');
  }

  function onCellClick(row, col, cellEl) {
    if (isReadOnly) return;
    if (isCellFullyFound(row, col)) return;

    const { selection, reset } = selectionMgr.tapCell({ row, col });

    if (reset) {
      clearAllSelectingClasses();
    }

    // Ve lai toan bo lua chon hien tai
    clearAllSelectingClasses();
    const selectionWithLetters = selection.map((s) => ({
      ...s,
      letter: grid[s.row][s.col],
    }));
    selectionWithLetters.forEach((s) => {
      const el = cellElements[s.row][s.col];
      if (!isCellFullyFound(s.row, s.col)) anim.markSelecting(el);
    });

    const matchedWord = checkMatch(selectionWithLetters, foundKeywords);
    if (matchedWord) {
      onKeywordFound(matchedWord, selectionWithLetters);
    }
  }

  function clearAllSelectingClasses() {
    document.querySelectorAll('.cell-selecting').forEach((el) => {
      anim.clearSelecting(el);
    });
  }

  function onKeywordFound(word, selection) {
    foundKeywords.push(word);
    selection.forEach((s) => {
      const el = cellElements[s.row][s.col];
      anim.markCorrect(el);
      if (isCellFullyFound(s.row, s.col)) el.classList.add('cell-locked');
    });
    selectionMgr.reset();
    renderKeywordList();
    renderProgress();
    persist();

    if (foundKeywords.length === KEYWORDS.length) {
      onWin();
    }
  }

  function onWin() {
    isReadOnly = true;
    state.winTime = Date.now();
    applyReadOnly();
    persist();
    anim.showVictoryDialog(dom.victoryDialogEl);
  }

  function closeVictoryDialog() {
    anim.hideVictoryDialog(dom.victoryDialogEl);
  }

  function handleExport() {
    exportResultImage({ ...state, winTime: state.winTime }, grid, placements);
  }

  function init() {
    renderPlayerInfo();
    renderGrid();
    renderKeywordList();
    renderProgress();
    if (foundKeywords.length > 0) lockFoundCells();
    if (isReadOnly) {
      applyReadOnly();
      if (state.winTime) {
        // Khoi phuc trang thai da thang khi tai lai trang, khong hien dialog tu dong
      }
    }
  }

  return { init, closeVictoryDialog, handleExport };
}

export function startNewMatrix() {
  return generateMatrix();
}