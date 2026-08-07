// main.js - Entry point duy nhat
import { loadState, saveState, createInitialState } from './storage.js';
import { startNewMatrix, createGame } from './game.js';

const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const startForm = document.getElementById('start-form');
const fullNameInput = document.getElementById('full-name');
const studentIdInput = document.getElementById('student-id');
const formErrorEl = document.getElementById('form-error'); //lấy phần tử hiển thị lỗi trong form, để thông báo cho người dùng khi họ không nhập đầy đủ thông tin.

const dom = {
  gridEl: document.getElementById('grid'),
  keywordListEl: document.getElementById('keyword-list'),
  progressEl: document.getElementById('progress'),
  playerNameEl: document.getElementById('player-name'),
  playerIdEl: document.getElementById('player-id'),
  victoryDialogEl: document.getElementById('victory-dialog'),
};

function showScreen(screenEl) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  screenEl.classList.add('active');
}

function launchGame(state) {
  showScreen(gameScreen);
  const game = createGame({ dom, state });
  game.init();

  document.getElementById('close-victory-btn').onclick = () => game.closeVictoryDialog();
  document.getElementById('export-btn').onclick = () => game.handleExport();
}

function bootstrap() {
  const saved = loadState();

  if (saved && saved.grid) {
    // Da co du lieu cu -> khoi phuc luon, khong can nhap lai
    launchGame(saved);
    return;
  }

  showScreen(welcomeScreen);
  startForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = fullNameInput.value.trim();
    const studentId = studentIdInput.value.trim();
    if (!fullName) {
      showFormError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!/^\d{10}$/.test(studentId)) {
      showFormError('Mã số sinh viên phải gồm đúng 10 chữ số, không chứa chữ cái.');
      return;
    }
    hideFormError();

    const { grid, placements } = startNewMatrix();
    const state = {
      ...createInitialState(fullName, studentId),
      grid,
      placements,
    };
    saveState(state);
    launchGame(state);
  });
}

function showFormError(message) {
  formErrorEl.textContent = message;
  formErrorEl.classList.remove('hidden');
}

function hideFormError() {
  formErrorEl.classList.add('hidden');
}

bootstrap();