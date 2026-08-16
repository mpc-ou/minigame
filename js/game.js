// game.js - "Nhac truong": giu state, goi cac module khac
import { GRID_SIZE, KEYWORDS, HINT_INTERVAL_MS } from './config.js';
import { generateMatrix } from './matrix.js';
import { createSelectionManager } from './selection.js';
import { checkMatch } from './validator.js';
import { saveState, clearState } from './storage.js';
import { randomInt, maskWord } from './utils.js';
import * as anim from './animation.js';
import { exportResultImage } from './capture.js';

export function createGame({ dom, state }) {
  let grid = state.grid;
  let placements = state.placements;
  const foundKeywords = [...state.foundKeywords];
  let isReadOnly = state.isWin;
  let infoSubmitted = state.infoSubmitted;
  let exported = state.exported;

  const selectionMgr = createSelectionManager();
  const cellElements = []; // ma tran cac the div, cellElements[r][c]

  // Goi y theo thoi gian: word -> chuoi da che ky tu (VD "B_T_ON"). Khong
  // luu vao localStorage, chi ton tai trong phien choi hien tai.
  const hintedWords = {};
  let hintTimerId = null;

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
      infoSubmitted,
      exported,
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

  // Danh sach tu khoa khong hien chu that ra ngoai: tu chua tim thay ngay tu
  // dau da hien so gach duoi dung bang do dai tu (VD "______") de nguoi choi
  // biet duong ma tim, sau do goi y theo thoi gian se lo dan 1 vai ky tu
  function renderKeywordList() {
    dom.keywordListEl.innerHTML = '';
    KEYWORDS.forEach((word) => {
      const chip = document.createElement('span');
      const isFound = foundKeywords.includes(word);
      chip.className = 'keyword-chip' + (isFound ? ' found' : '');
      if (isFound) {
        chip.textContent = word;
      } else if (hintedWords[word]) {
        chip.textContent = hintedWords[word];
        chip.classList.add('hinted');
      } else {
        chip.textContent = '_'.repeat(word.length);
      }
      dom.keywordListEl.appendChild(chip);
    });
  }

  // Cu HINT_INTERVAL_MS troi qua ma con tu chua tim duoc thi tu dong che
  // bot ky tu 1 tu ngau nhien de goi y. Uu tien tu chua tung duoc goi y de
  // moi lan hen gio deu mang lai thong tin moi cho nguoi choi.
  function startHintTimer() {
    hintTimerId = setInterval(() => {
      const unfound = KEYWORDS.filter((w) => !foundKeywords.includes(w));
      if (unfound.length === 0) {
        stopHintTimer();
        return;
      }
      const notYetHinted = unfound.filter((w) => !hintedWords[w]);
      const pool = notYetHinted.length > 0 ? notYetHinted : unfound;
      const word = pool[randomInt(pool.length)];
      hintedWords[word] = maskWord(word);
      renderKeywordList();
    }, HINT_INTERVAL_MS);
  }

  function stopHintTimer() {
    if (hintTimerId) {
      clearInterval(hintTimerId);
      hintTimerId = null;
    }
  }

  function renderProgress() {
    dom.progressEl.textContent = `${foundKeywords.length}/${KEYWORDS.length}`;
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

  // Panel hien sau khi thang, noi dung thay doi theo tung buoc trong luong:
  // chua nhap ten/MSSV -> da nhap nhung chua xuat anh -> da xuat xong
  function renderPostWinPanel() {
    if (!isReadOnly) {
      dom.postWinPanelEl.classList.add('hidden');
      return;
    }
    dom.postWinPanelEl.classList.remove('hidden');
    dom.saveProofBtn.classList.add('hidden');
    dom.exportActionBtn.classList.add('hidden');

    if (!infoSubmitted) {
      dom.postWinStatusEl.textContent = 'Bạn đã hoàn thành thử thách! Lưu minh chứng để xuất ảnh kết quả.';
      dom.saveProofBtn.classList.remove('hidden');
    } else if (!exported) {
      dom.postWinStatusEl.textContent = `Người chơi: ${state.fullName} — MSSV: ${state.studentId}`;
      dom.exportActionBtn.classList.remove('hidden');
    } else {
      dom.postWinStatusEl.textContent = `Đã xuất minh chứng cho ${state.fullName} — MSSV: ${state.studentId} ✓`;
    }
  }

  // Xoa toan bo du lieu van hien tai va tai lai trang tu dau (dung khi
  // nguoi choi muon choi lai hoac nguoi khac muon muon may choi moi)
  function handleReset() {
    if (!window.confirm('Xóa toàn bộ tiến trình hiện tại và chơi lại từ đầu?')) return;
    clearState();
    window.location.reload();
  }

  function onCellClick(row, col, cellEl) {
    if (isReadOnly) return;
    if (isCellFullyFound(row, col)) return;

    const selection = selectionMgr.tapCell({ row, col });

    // Ve lai toan bo lua chon hien tai (xoa het roi to lai theo selection moi,
    // ap dung cho ca truong hop bo chon 1 phan chuoi)
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
    stopHintTimer();
    applyReadOnly();
    persist();
    renderPostWinPanel();
    anim.showDialog(dom.victoryDialogEl, true);
    anim.launchConfetti(dom.confettiCanvasEl);
  }

  function closeVictoryDialog() {
    anim.hideDialog(dom.victoryDialogEl);
  }

  // Mo modal nhap ten/MSSV - chi duoc goi khi chua infoSubmitted (nut
  // "Luu minh chung" da bi an ngay sau khi nhap thanh cong 1 lan)
  function openInfoDialog() {
    dom.infoFormErrorEl.classList.add('hidden');
    dom.infoFormEl.reset();
    anim.showDialog(dom.infoDialogEl);
  }

  function closeInfoDialog() {
    anim.hideDialog(dom.infoDialogEl);
  }

  function handleInfoSubmit(fullName, studentId) {
    if (!fullName) {
      showInfoError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!/^\d{10}$/.test(studentId)) {
      showInfoError('Mã số sinh viên phải gồm đúng 10 chữ số, không chứa chữ cái.');
      return;
    }
    state.fullName = fullName;
    state.studentId = studentId;
    infoSubmitted = true;
    persist();
    closeInfoDialog();
    renderPostWinPanel();
  }

  function showInfoError(message) {
    dom.infoFormErrorEl.textContent = message;
    dom.infoFormErrorEl.classList.remove('hidden');
  }

  async function handleExportAction() {
    const success = await exportResultImage(state, grid, placements, dom.exportActionBtn);
    if (success) {
      exported = true;
      persist();
      renderPostWinPanel();
    }
  }

  function init() {
    renderGrid();
    renderKeywordList();
    renderProgress();
    if (foundKeywords.length > 0) lockFoundCells();
    if (isReadOnly) {
      applyReadOnly();
      renderPostWinPanel();
    } else {
      startHintTimer();
    }
  }

  return {
    init,
    closeVictoryDialog,
    openInfoDialog,
    handleInfoSubmit,
    handleExportAction,
    handleReset,
  };
}

export function startNewMatrix() {
  return generateMatrix();
}
