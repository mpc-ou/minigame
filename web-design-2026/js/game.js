import { GRID_SIZE, KEYWORDS, HINT_INTERVAL_MS, HINT_URGENT_THRESHOLD_S, GGFORM_URL, TOPIC } from './config.js';
import { generateMatrix } from './matrix.js';
import { createSelectionManager } from './selection.js';
import { checkMatch } from './validator.js';
import { saveState, clearState } from './storage.js';
import { randomInt, maskWord } from './utils.js';
import * as anim from './animation.js';
import { exportResultImage } from './capture.js';
import { playTapSound, playDeselectSound, playMatchSound, playWinSound, playHintReadySound, playHintRevealSound } from './audio.js';
import { showModalConfirm } from './modal.js';

export function createGame({ dom, state }) {
  let grid = state.grid;
  let placements = state.placements;
  const foundKeywords = [...state.foundKeywords];
  let isReadOnly = state.isWin;
  let infoSubmitted = state.infoSubmitted;
  let exported = state.exported;

  const selectionMgr = createSelectionManager();
  const cellElements = [];

  const hintedWords = { ...(state.hintedWords || {}) };
  let hintTimerId = null;
  let nextHintAt = null;
  let isHintReady = false;

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
      hintedWords,
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

  function renderTopic() {
    if (dom.gameTopicEl) dom.gameTopicEl.textContent = TOPIC;
    if (dom.coverTopicEl) dom.coverTopicEl.textContent = TOPIC;
  }

  function updateHintDisplay() {
    if (isReadOnly) {
      stopHintTimer(true);
      return;
    }

    const unfound = KEYWORDS.filter((w) => !foundKeywords.includes(w));
    if (unfound.length === 0) {
      stopHintTimer(true);
      return;
    }

    const notYetHinted = unfound.filter((w) => !hintedWords[w]);
    if (notYetHinted.length === 0) {
      stopHintTimer(false);
      isHintReady = false;
      dom.mascotHintPopupEl.classList.remove('hidden', 'clickable');
      dom.hintCloudEl.classList.remove('ready');
      dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
      dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      return;
    }

    if (!isHintReady && !hintTimerId) {
      startHintTimer();
    }
  }

  function startHintTimer() {
    if (isReadOnly) return;
    const unfound = KEYWORDS.filter((w) => !foundKeywords.includes(w));
    if (unfound.length === 0) {
      stopHintTimer(true);
      return;
    }

    const notYetHinted = unfound.filter((w) => !hintedWords[w]);
    if (notYetHinted.length === 0) {
      stopHintTimer(false);
      isHintReady = false;
      dom.mascotHintPopupEl.classList.remove('hidden', 'clickable');
      dom.hintCloudEl.classList.remove('ready');
      dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
      dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      return;
    }

    isHintReady = false;
    dom.mascotHintPopupEl.classList.remove('hidden', 'clickable');
    dom.hintCloudEl.classList.remove('ready');
    dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';

    nextHintAt = Date.now() + HINT_INTERVAL_MS;
    tickHintCountdown();
    if (hintTimerId) clearInterval(hintTimerId);
    hintTimerId = setInterval(tickHintCountdown, 1000);
  }

  function tickHintCountdown() {
    const unfound = KEYWORDS.filter((w) => !foundKeywords.includes(w));
    if (unfound.length === 0) {
      stopHintTimer(true);
      return;
    }

    const notYetHinted = unfound.filter((w) => !hintedWords[w]);
    if (notYetHinted.length === 0) {
      stopHintTimer(false);
      isHintReady = false;
      dom.hintCloudEl.classList.remove('ready');
      dom.mascotHintPopupEl.classList.remove('clickable');
      dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
      dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      return;
    }

    const remainingMs = nextHintAt - Date.now();
    if (remainingMs <= 0) {
      // Countdown completed: hint is now ready to be clicked by player!
      if (hintTimerId) {
        clearInterval(hintTimerId);
        hintTimerId = null;
      }
      isHintReady = true;
      dom.hintCloudEl.classList.add('ready');
      dom.mascotHintPopupEl.classList.add('clickable');
      dom.hintMascotEl.src = 'assets/mascot/mascot-shy.png';
      dom.hintCloudTextEl.textContent = '💡 Gợi ý?';
      playHintReadySound();
      return;
    }

    const remainingS = Math.max(1, Math.ceil(remainingMs / 1000));
    dom.hintMascotEl.src =
      remainingS <= HINT_URGENT_THRESHOLD_S
        ? 'assets/mascot/mascot-cry.png'
        : 'assets/mascot/mascot-idle.png';
    dom.hintCloudTextEl.textContent = `${remainingS}s`;
  }

  function handleHintClick() {
    if (!isHintReady || isReadOnly) return;

    const unfound = KEYWORDS.filter((w) => !foundKeywords.includes(w));
    const notYetHinted = unfound.filter((w) => !hintedWords[w]);
    if (notYetHinted.length === 0) {
      stopHintTimer(false);
      isHintReady = false;
      dom.hintCloudEl.classList.remove('ready');
      dom.mascotHintPopupEl.classList.remove('clickable');
      dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
      dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      return;
    }

    // Reveal one hint
    const word = notYetHinted[randomInt(notYetHinted.length)];
    hintedWords[word] = maskWord(word);
    playHintRevealSound();
    renderKeywordList();
    persist();

    // Check if more unhinted words remain
    const remainingUnhinted = unfound.filter((w) => !hintedWords[w]);
    if (remainingUnhinted.length === 0) {
      stopHintTimer(false);
      isHintReady = false;
      dom.hintCloudEl.classList.remove('ready');
      dom.mascotHintPopupEl.classList.remove('clickable');
      dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
      dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
    } else {
      // Start next 30s countdown
      startHintTimer();
    }
  }

  function stopHintTimer(hideWidget = true) {
    if (hintTimerId) {
      clearInterval(hintTimerId);
      hintTimerId = null;
    }
    isHintReady = false;
    if (hideWidget && dom.mascotHintPopupEl) {
      dom.mascotHintPopupEl.classList.add('hidden');
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

  function renderPostWinPanel() {
    if (!isReadOnly) {
      dom.postWinPanelEl.classList.add('hidden');
      return;
    }
    dom.postWinPanelEl.classList.remove('hidden');
    dom.saveProofBtn.classList.add('hidden');
    dom.exportActionBtn.classList.add('hidden');
    dom.ggformLinkEl.classList.add('hidden');

    if (!infoSubmitted) {
      dom.postWinStatusEl.textContent = 'Bạn đã hoàn thành thử thách! Lưu minh chứng để xuất ảnh kết quả.';
      dom.saveProofBtn.classList.remove('hidden');
      return;
    }

    dom.postWinStatusEl.textContent = exported
      ? `Đã xuất minh chứng cho ${state.fullName} — MSSV: ${state.studentId}`
      : `Người chơi: ${state.fullName} — MSSV: ${state.studentId}`;
    dom.exportActionBtn.classList.remove('hidden');
    dom.exportActionBtn.innerHTML = exported
      ? '<i class="fa-solid fa-download"></i> Xuất ảnh lại'
      : '<i class="fa-solid fa-download"></i> Xuất ảnh';

    if (exported && GGFORM_URL) {
      dom.ggformLinkEl.href = GGFORM_URL;
      dom.ggformLinkEl.classList.remove('hidden');
    }
  }

  async function handleReset() {
    const confirmed = await showModalConfirm({
      title: 'Chơi lại từ đầu?',
      message: 'Toàn bộ tiến trình ván chơi hiện tại sẽ bị xóa và ma trận mới sẽ được tạo.',
      confirmText: 'Chơi lại',
      cancelText: 'Tiếp tục chơi',
      danger: true,
      mascot: 'assets/mascot/mascot-cry.png',
    });
    if (!confirmed) return;
    clearState();
    window.location.reload();
  }

  function onCellClick(row, col, cellEl) {
    if (isReadOnly) return;
    if (isCellFullyFound(row, col)) return;

    const prevCount = selectionMgr.getSelection().length;
    const selection = selectionMgr.tapCell({ row, col });

    if (selection.length < prevCount) {
      playDeselectSound();
    } else {
      playTapSound();
    }

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
    playMatchSound();
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
    } else {
      updateHintDisplay();
    }
  }

  function onWin() {
    isReadOnly = true;
    state.winTime = Date.now();
    stopHintTimer(true);
    applyReadOnly();
    persist();
    renderPostWinPanel();
    playWinSound();
    anim.showDialog(dom.victoryDialogEl, true);
    anim.launchConfetti(dom.confettiCanvasEl);
  }

  function closeVictoryDialog() {
    anim.hideDialog(dom.victoryDialogEl);
  }

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
    renderTopic();
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

    if (dom.mascotHintPopupEl) {
      dom.mascotHintPopupEl.onclick = handleHintClick;
    }
  }

  return {
    init,
    closeVictoryDialog,
    openInfoDialog,
    handleInfoSubmit,
    handleExportAction,
    handleReset,
    handleHintClick,
  };
}

export function startNewMatrix() {
  return generateMatrix();
}
