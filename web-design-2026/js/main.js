import { loadState, saveState, clearState, createInitialState } from './storage.js';
import { startNewMatrix, createGame } from './game.js';
import { KEYWORDS, TOPIC } from './config.js';
import { showDialog, hideDialog } from './animation.js';
import { isSoundEnabled, toggleSound, playCountdownBeep } from './audio.js';
import { showModalConfirm } from './modal.js';

const coverScreen = document.getElementById('cover-screen');
const gameScreen = document.getElementById('game-screen');
const coverStatusEl = document.getElementById('cover-status');
const guideDialogEl = document.getElementById('guide-dialog');

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
  coverTopicEl: document.getElementById('cover-topic'),
  gameTopicEl: document.getElementById('game-topic'),
  mascotHintPopupEl: document.getElementById('mascot-hint-popup'),
  hintCloudEl: document.getElementById('hint-cloud'),
  hintCloudTextEl: document.getElementById('hint-cloud-text'),
  hintMascotEl: document.getElementById('hint-mascot'),
  countdownOverlayEl: document.getElementById('countdown-overlay'),
  countdownNumberEl: document.getElementById('countdown-number'),
  soundBtnCover: document.getElementById('sound-btn-cover'),
  soundBtnGame: document.getElementById('sound-btn-game'),
};

function updateSoundButtons(enabled) {
  const iconHtml = enabled
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  if (dom.soundBtnCover) dom.soundBtnCover.innerHTML = iconHtml;
  if (dom.soundBtnGame) dom.soundBtnGame.innerHTML = iconHtml;
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

let gameInstance = null;

function launchGame(state) {
  if (!gameInstance) {
    gameInstance = createGame({ dom, state });
    document.getElementById('reset-btn').onclick = () => gameInstance.handleReset();
    document.getElementById('close-victory-btn').onclick = () => gameInstance.closeVictoryDialog();
    dom.saveProofBtn.onclick = () => gameInstance.openInfoDialog();
    dom.exportActionBtn.onclick = () => gameInstance.handleExportAction();

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
  return (
    !!saved &&
    !!saved.grid &&
    !!saved.placements &&
    Array.isArray(saved.foundKeywords) &&
    KEYWORDS.every((word) => Array.isArray(saved.placements[word])) &&
    saved.foundKeywords.every((word) => Array.isArray(saved.placements[word]))
  );
}

function bootstrap() {
  let saved = loadState();

  if (!isValidSavedState(saved)) {
    const { grid, placements } = startNewMatrix();
    saved = { ...createInitialState(), grid, placements };
    saveState(saved);
  }

  return saved;
}

function renderCoverStatus(saved) {
  if (dom.coverTopicEl) dom.coverTopicEl.textContent = TOPIC;
  if (saved.isWin) {
    coverStatusEl.textContent = 'Bạn đã hoàn thành ván trước - bấm Chơi để xem lại kết quả.';
  } else if (saved.foundKeywords.length > 0) {
    coverStatusEl.textContent = `Đang chơi dở: ${saved.foundKeywords.length}/${KEYWORDS.length} từ khóa.`;
  } else {
    coverStatusEl.textContent = 'Sẵn sàng bắt đầu.';
  }
}

const savedState = bootstrap();
setupSoundToggle();
renderCoverStatus(savedState);
showScreen(coverScreen);

let isStarting = false;
document.getElementById('play-btn').onclick = () => {
  if (isStarting) return;

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
    title: 'Bắt đầu ván mới?',
    message: 'Hành động này sẽ xóa toàn bộ tiến trình hiện tại và tạo một ma trận mới.',
    confirmText: 'Xóa & Bắt đầu lại',
    cancelText: 'Quay lại',
    danger: true,
    mascot: 'assets/mascot/mascot-cry.png',
  });
  if (!confirmed) return;
  clearState();
  window.location.reload();
};

document.getElementById('info-btn-cover').onclick = () => showDialog(guideDialogEl);
document.getElementById('info-btn-game').onclick = () => showDialog(guideDialogEl);
document.getElementById('close-guide-btn').onclick = () => hideDialog(guideDialogEl);
