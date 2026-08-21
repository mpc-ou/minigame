import { GRID_SIZE, HINT_INTERVAL_MS, HINT_URGENT_THRESHOLD_S, GGFORM_URL, TOPIC, TEXTS } from './config.js';
import { generateMatrix } from './matrix.js';
import { createSelectionManager } from './selection.js';
import { checkMatch } from './validator.js';
import { saveState, clearState } from './storage.js';
import { randomInt, randomLetter, maskWord } from './utils.js';
import * as anim from './animation.js';
import { exportResultImage } from './capture.js';
import { playTapSound, playDeselectSound, playMatchSound, playWinSound, playHintReadySound, playHintRevealSound } from './audio.js';
import { showModalConfirm, showModalAlert } from './modal.js';

export function createGame({ dom, state }) {
  let grid = state.grid;
  let placements = state.placements;

  // Auto-heal: ensure grid is a valid GRID_SIZE x GRID_SIZE matrix
  if (
    !grid ||
    !Array.isArray(grid) ||
    grid.length !== GRID_SIZE ||
    !Array.isArray(grid[0]) ||
    grid[0].length !== GRID_SIZE ||
    !placements
  ) {
    const generated = generateMatrix(state.keywords);
    grid = generated.grid;
    placements = generated.placements;
    state.grid = grid;
    state.placements = placements;
    if (!state.keywords || !Array.isArray(state.keywords) || state.keywords.length === 0) {
      state.keywords = generated.keywords;
    }
    saveState(state);
  }

  const foundKeywords = [...(state.foundKeywords || [])];
  let isReadOnly = state.isWin;
  let infoSubmitted = state.infoSubmitted;
  let exported = state.exported;

  const activeKeywordObjects = state.keywords && state.keywords.length > 0
    ? state.keywords
    : Object.keys(placements).map((k) => ({ keyword: k, description: '' }));
  const activeKeywords = activeKeywordObjects.map((k) => (typeof k === 'string' ? k : k.keyword));
  const descriptionMap = Object.fromEntries(
    activeKeywordObjects.map((k) => [typeof k === 'string' ? k : k.keyword, typeof k === 'string' ? '' : (k.description || '')])
  );

  const selectionMgr = createSelectionManager();
  const cellElements = [];

  const hintedWords = { ...(state.hintedWords || {}) };
  let hintTimerId = null;
  let nextHintAt = null;
  let isHintReady = false;
  let isCometFlying = false;

  const cellWordsMap = {};
  Object.entries(placements).forEach(([word, cells]) => {
    if (Array.isArray(cells)) {
      cells.forEach(({ r, c }) => {
        const key = `${r}_${c}`;
        if (!cellWordsMap[key]) cellWordsMap[key] = [];
        cellWordsMap[key].push(word);
      });
    }
  });

  function isCellFullyFound(row, col) {
    const words = cellWordsMap[`${row}_${col}`];
    if (!words) return false;
    return words.every((w) => foundKeywords.includes(w));
  }

  function persist() {
    saveState({
      ...state,
      keywords: activeKeywordObjects,
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
      const row = (grid && grid[r]) || [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.textContent = row[c] || randomLetter();
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
    activeKeywords.forEach((word) => {
      const chip = document.createElement('span');
      chip.dataset.keyword = word;
      const isFound = foundKeywords.includes(word);
      const isHinted = !!hintedWords[word];
      const desc = descriptionMap[word] || '';

      chip.className = 'keyword-chip' + (isFound ? ' found' : isHinted ? ' hinted' : ' unhinted');

      if (isFound) {
        chip.innerHTML = `<span class="chip-text">${word}</span>`;
      } else if (isHinted) {
        chip.innerHTML = `<span class="chip-text">${hintedWords[word]}</span>${desc ? '<i class="fa-solid fa-circle-question chip-hint-icon" title="Bấm xem mô tả"></i>' : ''}`;
      } else {
        chip.innerHTML = `<span class="chip-text">${'_'.repeat(word.length)}</span>`;
      }

      if (desc && (isHinted || isFound)) {
        chip.title = `Gợi ý: ${desc}`;
        chip.setAttribute('aria-label', `Gợi ý: ${desc}`);
        chip.classList.add('has-tooltip');
        chip.addEventListener('click', () => {
          showModalAlert({
            title: isFound ? `Từ khóa: ${word}` : `Gợi ý cho từ "${hintedWords[word] || word}"`,
            message: desc,
            mascot: isFound ? 'assets/mascot/mascot-cheer.png' : 'assets/mascot/mascot-idle.png',
            btnText: 'Đã hiểu',
          });
        });
      }

      dom.keywordListEl.appendChild(chip);
    });
  }

  function renderTopic() {
    if (dom.gameTopicEl) dom.gameTopicEl.textContent = TOPIC;
  }

  function updateHintDisplay() {
    if (isReadOnly) {
      stopHintTimer(true);
      return;
    }

    const unfound = activeKeywords.filter((w) => !foundKeywords.includes(w));
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
    const unfound = activeKeywords.filter((w) => !foundKeywords.includes(w));
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
    const unfound = activeKeywords.filter((w) => !foundKeywords.includes(w));
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
    if (!isHintReady || isReadOnly || isCometFlying) return;

    const unfound = activeKeywords.filter((w) => !foundKeywords.includes(w));
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

    const targetWord = notYetHinted[randomInt(notYetHinted.length)];
    const targetChipEl = dom.keywordListEl.querySelector(`[data-keyword="${targetWord}"]`);

    isCometFlying = true;
    isHintReady = false;
    dom.hintCloudEl.classList.remove('ready');
    dom.mascotHintPopupEl.classList.remove('clickable');

    anim.launchCometHint(dom.mascotHintPopupEl, targetChipEl, () => {
      isCometFlying = false;
      hintedWords[targetWord] = maskWord(targetWord);
      playHintRevealSound();
      renderKeywordList();
      persist();

      const remainingUnhinted = unfound.filter((w) => w !== targetWord && !hintedWords[w]);
      if (remainingUnhinted.length === 0) {
        stopHintTimer(false);
        isHintReady = false;
        dom.hintCloudEl.classList.remove('ready');
        dom.mascotHintPopupEl.classList.remove('clickable');
        dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
        dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      } else {
        startHintTimer();
      }
    });
  }

  function stopHintTimer(hideWidget = false) {
    if (hintTimerId) {
      clearInterval(hintTimerId);
      hintTimerId = null;
    }
    isHintReady = false;
    if (dom.mascotHintPopupEl) {
      if (hideWidget) {
        dom.mascotHintPopupEl.classList.add('hidden');
      } else {
        dom.mascotHintPopupEl.classList.remove('hidden', 'clickable');
        if (dom.hintCloudEl) dom.hintCloudEl.classList.remove('ready');
        if (dom.hintMascotEl) dom.hintMascotEl.src = 'assets/mascot/mascot-idle.png';
        if (dom.hintCloudTextEl) dom.hintCloudTextEl.textContent = 'Hết gợi ý ✨';
      }
    }
  }

  function renderProgress() {
    dom.progressEl.textContent = `${foundKeywords.length}/${activeKeywords.length}`;
  }

  function lockFoundCells() {
    foundKeywords.forEach((word) => {
      const cells = placements[word];
      if (cells) {
        cells.forEach(({ r, c }) => {
          cellElements[r][c].classList.add('cell-correct');
          if (isCellFullyFound(r, c)) cellElements[r][c].classList.add('cell-locked');
        });
      }
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

    const matchedWord = checkMatch(selectionWithLetters, foundKeywords, activeKeywords);
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

    if (foundKeywords.length === activeKeywords.length) {
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
      showInfoError(TEXTS.MODALS.INFO_FORM.errNameRequired);
      return;
    }
    if (!/^\d{7,12}$/.test(studentId)) {
      showInfoError(TEXTS.MODALS.INFO_FORM.errStudentIdInvalid);
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
      stopHintTimer(true);
    } else {
      if (dom.mascotHintPopupEl) {
        dom.mascotHintPopupEl.classList.remove('hidden');
        dom.mascotHintPopupEl.onclick = handleHintClick;
      }
      startHintTimer();
    }
  }

  return {
    init,
    closeVictoryDialog,
    openInfoDialog,
    closeInfoDialog,
    handleInfoSubmit,
    handleExportAction,
    handleReset,
    handleHintClick,
  };
}

export function startNewMatrix(keywordItems = null) {
  return generateMatrix(keywordItems);
}
