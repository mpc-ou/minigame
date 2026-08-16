// main.js - Entry point duy nhat
import { loadState, saveState, clearState, createInitialState } from './storage.js';
import { startNewMatrix, createGame } from './game.js';
import { KEYWORDS } from './config.js';

const coverScreen = document.getElementById('cover-screen');
const gameScreen = document.getElementById('game-screen');
const coverStatusEl = document.getElementById('cover-status');

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
  infoDialogEl: document.getElementById('info-dialog'),
  infoFormEl: infoForm,
  infoFormErrorEl: document.getElementById('form-error'),
};

function launchGame(state) {
  const game = createGame({ dom, state });

  // Gan nut "Xoa ket qua / Choi lai" TRUOC khi goi init(): day la loi thoat
  // du phong, phai luon hoat dong ke ca khi init() gap loi khi khoi phuc 1
  // state cu/hong (vi du du lieu localStorage tu 1 phien ban truoc)
  document.getElementById('reset-btn').onclick = () => game.handleReset();

  game.init();

  document.getElementById('close-victory-btn').onclick = () => game.closeVictoryDialog();
  dom.saveProofBtn.onclick = () => game.openInfoDialog();
  dom.exportActionBtn.onclick = () => game.handleExportAction();

  infoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    game.handleInfoSubmit(infoFullNameInput.value.trim(), infoStudentIdInput.value.trim());
  });
}

// Doi pho voi du lieu cu/khong khop schema hien tai (VD: luu tu 1 phien ban
// truoc do cua trang, hoac bi sua tay) - neu khong day du thi coi nhu chua
// co gi, tranh render nua voi hoac nem loi giua chung khi khoi phuc.
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
    // Chua co van choi nao (hoac du lieu cu khong khop) -> sinh ma tran ngau
    // nhien san, cho den khi bam Choi o man hinh bia moi thuc su vao choi
    const { grid, placements } = startNewMatrix();
    saved = { ...createInitialState(), grid, placements };
    saveState(saved);
  }

  return saved;
}

function renderCoverStatus(saved) {
  if (saved.isWin) {
    coverStatusEl.textContent = 'Bạn đã hoàn thành ván trước - bấm Chơi để xem lại kết quả.';
  } else if (saved.foundKeywords.length > 0) {
    coverStatusEl.textContent = `Đang chơi dở: ${saved.foundKeywords.length}/${KEYWORDS.length} từ khóa.`;
  } else {
    coverStatusEl.textContent = 'Sẵn sàng bắt đầu.';
  }
}

const savedState = bootstrap();
renderCoverStatus(savedState);
showScreen(coverScreen);

document.getElementById('play-btn').onclick = () => {
  showScreen(gameScreen);
  launchGame(savedState);
};

document.getElementById('cover-reset-btn').onclick = () => {
  if (!window.confirm('Xóa toàn bộ tiến trình hiện tại và bắt đầu ván mới?')) return;
  clearState();
  window.location.reload();
};
