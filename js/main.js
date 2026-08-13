// main.js - Entry point duy nhat
import { loadState, saveState, createInitialState } from './storage.js';
import { startNewMatrix, createGame } from './game.js';
import { KEYWORDS } from './config.js';

const infoForm = document.getElementById('info-form');
const infoFullNameInput = infoForm.querySelector('#full-name');
const infoStudentIdInput = infoForm.querySelector('#student-id');

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
    // nhien ngay, khong can nhap gi
    const { grid, placements } = startNewMatrix();
    saved = { ...createInitialState(), grid, placements };
    saveState(saved);
  }

  launchGame(saved);
}

bootstrap();
