import { loadState, saveState, clearState, createInitialState } from './storage.js';
import { startNewMatrix, createGame } from './game.js';
import { GRID_SIZE, NUMBER_KEYWORD, TOPIC, TEXTS } from './config.js';
import { showDialog, hideDialog, playIntroCurtainAnimation } from './animation.js';
import { isSoundEnabled, toggleSound, isMusicEnabled, toggleMusic, playBgm, playCountdownBeep } from './audio.js';
import { showModalConfirm } from './modal.js';

const coverScreen = document.getElementById('cover-screen');
const gameScreen = document.getElementById('game-screen');
const coverStatusEl = document.getElementById('cover-status');
const guideDialogEl = document.getElementById('guide-dialog');
const introLoaderEl = document.getElementById('page-intro-loader');

const infoForm = document.getElementById('info-form');
const infoFullNameInput = infoForm.querySelector('#full-name');
const infoStudentIdInput = infoForm.querySelector('#student-id');

function showScreen(screenEl) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  screenEl.classList.add('active');
}

const dom = {
  gridEl: document.getElementById('grid'),
  keywordListEl: document.getElementById('keyword-list'),
  progressEl: document.getElementById('progress'),
  victoryDialogEl: document.getElementById('victory-dialog'),
  confettiCanvasEl: document.getElementById('confetti-canvas'),
  postWinPanelEl: document.getElementById('post-win-panel'),
  postWinStatusEl: document.getElementById('post-win-status'),
  saveProofBtn: document.getElementById('save-proof-btn'),
  exportActionBtn: document.getElementById('export-action-btn'),
  ggformLinkEl: document.getElementById('ggform-link'),
  infoDialogEl: document.getElementById('info-dialog'),
  infoFormEl: infoForm,
  infoFormErrorEl: document.getElementById('form-error'),
  closeInfoBtn: document.getElementById('close-info-btn'),
  gameTopicEl: document.getElementById('game-topic'),
  mascotHintPopupEl: document.getElementById('mascot-hint-popup'),
  hintCloudEl: document.getElementById('hint-cloud'),
  hintCloudTextEl: document.getElementById('hint-cloud-text'),
  hintMascotEl: document.getElementById('hint-mascot'),
  countdownOverlayEl: document.getElementById('countdown-overlay'),
  countdownNumberEl: document.getElementById('countdown-number'),
  soundBtnCover: document.getElementById('sound-btn-cover'),
  soundBtnGame: document.getElementById('sound-btn-game'),
  musicBtnCover: document.getElementById('music-btn-cover'),
  musicBtnGame: document.getElementById('music-btn-game'),
};

function updateSoundButtons(enabled) {
  const iconHtml = enabled
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  if (dom.soundBtnCover) {
    dom.soundBtnCover.classList.toggle('muted', !enabled);
    dom.soundBtnCover.innerHTML = iconHtml;
  }
  if (dom.soundBtnGame) {
    dom.soundBtnGame.classList.toggle('muted', !enabled);
    dom.soundBtnGame.innerHTML = iconHtml;
  }
}

function setupSoundToggle() {
  updateSoundButtons(isSoundEnabled());
  const onToggle = () => {
    const enabled = toggleSound();
    updateSoundButtons(enabled);
  };
  if (dom.soundBtnCover) dom.soundBtnCover.onclick = onToggle;
  if (dom.soundBtnGame) dom.soundBtnGame.onclick = onToggle;
}

function updateMusicButtons(enabled) {
  if (dom.musicBtnCover) {
    dom.musicBtnCover.classList.toggle('muted', !enabled);
    dom.musicBtnCover.innerHTML = '<i class="fa-solid fa-music"></i>';
  }
  if (dom.musicBtnGame) {
    dom.musicBtnGame.classList.toggle('muted', !enabled);
    dom.musicBtnGame.innerHTML = '<i class="fa-solid fa-music"></i>';
  }
}

function setupMusicToggle() {
  updateMusicButtons(isMusicEnabled());
  const onToggle = () => {
    const enabled = toggleMusic();
    updateMusicButtons(enabled);
  };
  if (dom.musicBtnCover) dom.musicBtnCover.onclick = onToggle;
  if (dom.musicBtnGame) dom.musicBtnGame.onclick = onToggle;
}

function initAutoplayBgm() {
  const tryStart = () => {
    if (isMusicEnabled()) {
      playBgm();
    }
  };
  document.addEventListener('pointerdown', tryStart, { once: true });
  document.addEventListener('keydown', tryStart, { once: true });
}

let gameInstance = null;

function launchGame(state) {
  if (!gameInstance) {
    gameInstance = createGame({ dom, state });
    document.getElementById('reset-btn').onclick = () => gameInstance.handleReset();
    document.getElementById('close-victory-btn').onclick = () => gameInstance.closeVictoryDialog();
    dom.saveProofBtn.onclick = () => gameInstance.openInfoDialog();
    dom.exportActionBtn.onclick = () => gameInstance.handleExportAction();

    if (dom.closeInfoBtn) {
      dom.closeInfoBtn.onclick = () => gameInstance.closeInfoDialog();
    }

    infoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      gameInstance.handleInfoSubmit(infoFullNameInput.value.trim(), infoStudentIdInput.value.trim());
    });
  }

  gameInstance.init();
}

function runStartCountdown(onComplete) {
  const overlay = dom.countdownOverlayEl;
  const numEl = dom.countdownNumberEl;
  overlay.classList.remove('hidden');

  function setStep(text, isGo) {
    numEl.classList.remove('go');
    numEl.style.animation = 'none';
    void numEl.offsetWidth; // trigger reflow
    numEl.textContent = text;
    if (isGo) numEl.classList.add('go');
    numEl.style.animation = 'countdown-pop 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  setStep('3', false);
  playCountdownBeep(3);

  setTimeout(() => {
    setStep('2', false);
    playCountdownBeep(2);
  }, 850);

  setTimeout(() => {
    setStep('1', false);
    playCountdownBeep(1);
  }, 1700);

  setTimeout(() => {
    setStep('GO!', true);
    playCountdownBeep('GO');
  }, 2550);

  setTimeout(() => {
    overlay.classList.add('hidden');
    onComplete();
  }, 3200);
}

function isValidSavedState(saved) {
  if (!saved || !saved.grid || !saved.placements || !Array.isArray(saved.foundKeywords)) {
    return false;
  }
  if (
    !Array.isArray(saved.grid) ||
    saved.grid.length !== GRID_SIZE ||
    !Array.isArray(saved.grid[0]) ||
    saved.grid[0].length !== GRID_SIZE
  ) {
    return false;
  }
  // Verify all cells are valid non-empty strings
  for (let r = 0; r < GRID_SIZE; r++) {
    if (!Array.isArray(saved.grid[r]) || saved.grid[r].length !== GRID_SIZE) return false;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!saved.grid[r][c] || typeof saved.grid[r][c] !== 'string') return false;
    }
  }

  const keywordsList = Array.isArray(saved.keywords)
    ? saved.keywords.map((k) => (typeof k === 'string' ? k : k.keyword))
    : Object.keys(saved.placements);
  return (
    keywordsList.length > 0 &&
    keywordsList.every((word) => Array.isArray(saved.placements[word])) &&
    saved.foundKeywords.every((word) => Array.isArray(saved.placements[word]))
  );
}

function bootstrap() {
  let saved = loadState();

  if (!isValidSavedState(saved)) {
    const { grid, placements, keywords } = startNewMatrix();
    saved = { ...createInitialState(), grid, placements, keywords };
    saveState(saved);
  }

  return saved;
}

function renderCoverStatus(saved) {
  const totalKeywords = (saved.keywords && saved.keywords.length) || NUMBER_KEYWORD;
  if (saved.isWin) {
    coverStatusEl.textContent = TEXTS.COVER.STATUS_WIN;
  } else if (saved.foundKeywords.length > 0) {
    coverStatusEl.textContent = TEXTS.COVER.STATUS_IN_PROGRESS(saved.foundKeywords.length, totalKeywords);
  } else {
    coverStatusEl.textContent = TEXTS.COVER.STATUS_READY;
  }
}

const savedState = bootstrap();
setupSoundToggle();
setupMusicToggle();
initAutoplayBgm();
renderCoverStatus(savedState);
showScreen(coverScreen);

if (introLoaderEl) {
  playIntroCurtainAnimation(introLoaderEl);
}

let isStarting = false;
document.getElementById('play-btn').onclick = () => {
  if (isStarting) return;
  playBgm();

  if (savedState.isWin) {
    showScreen(gameScreen);
    launchGame(savedState);
  } else {
    isStarting = true;
    runStartCountdown(() => {
      isStarting = false;
      showScreen(gameScreen);
      launchGame(savedState);
    });
  }
};

document.getElementById('cover-reset-btn').onclick = async () => {
  const confirmed = await showModalConfirm({
    title: TEXTS.MODALS.RESET_CONFIRM.title,
    message: TEXTS.MODALS.RESET_CONFIRM.message,
    confirmText: TEXTS.MODALS.RESET_CONFIRM.confirmText,
    cancelText: TEXTS.MODALS.RESET_CONFIRM.cancelText,
    danger: true,
    mascot: 'assets/mascot/mascot-cry.png',
  });
  if (!confirmed) return;
  clearState();
  window.location.reload();
};

let guideLoaded = false;

async function openGuideDialog() {
  const guideContentEl = guideDialogEl ? guideDialogEl.querySelector('.guide-content') : null;
  if (!guideLoaded && guideContentEl) {
    guideContentEl.innerHTML = '<div class="guide-loading" style="text-align:center; padding: 24px; color: var(--accent);"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 26px; margin-bottom: 10px; display: block;"></i> Đang tải hướng dẫn...</div>';
    showDialog(guideDialogEl);
    try {
      const res = await fetch('content/guide.html');
      if (res.ok) {
        const html = await res.text();
        guideContentEl.innerHTML = html;
        guideLoaded = true;
      } else {
        throw new Error('Fetch failed');
      }
    } catch (e) {
      guideContentEl.innerHTML = TEXTS.DEFAULT_GUIDE_HTML;
      guideLoaded = true;
    }
  } else {
    showDialog(guideDialogEl);
  }
}

const infoBtnCover = document.getElementById('info-btn-cover');
const infoBtnGame = document.getElementById('info-btn-game');
const closeGuideBtn = document.getElementById('close-guide-btn');

if (infoBtnCover) infoBtnCover.onclick = openGuideDialog;
if (infoBtnGame) infoBtnGame.onclick = openGuideDialog;
if (closeGuideBtn) closeGuideBtn.onclick = () => hideDialog(guideDialogEl);
