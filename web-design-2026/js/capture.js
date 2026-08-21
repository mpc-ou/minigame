import { GAME_NAME, COMPETITION_NAME, TOPIC, GRID_SIZE } from './config.js';
import { formatDateTime, generateHash } from './utils.js';
import { showModalAlert } from './modal.js';

function buildCaptureCard(state, grid, placements) {
  const card = document.createElement('div');
  card.id = 'capture-card';
  card.className = 'capture-card';
  card.style.setProperty('--grid-size', GRID_SIZE);

  const winTimeStr = formatDateTime(new Date(state.winTime));
  const hash = generateHash(`${state.fullName}|${state.studentId}|${state.winTime}`);

  const correctSet = new Set();
  Object.values(placements).forEach((cells) => {
    cells.forEach((cell) => correctSet.add(`${cell.r}_${cell.c}`));
  });

  let gridHtml = '<div class="capture-grid">';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const isCorrect = correctSet.has(`${r}_${c}`);
      gridHtml += `<div class="capture-cell ${isCorrect ? 'correct' : ''}">${grid[r][c]}</div>`;
    }
  }
  gridHtml += '</div>';

  const keywordsList = (state.keywords && state.keywords.length > 0)
    ? state.keywords.map(k => typeof k === 'string' ? k : k.keyword)
    : Object.keys(placements);

  const keywordsHtml = keywordsList.map((w) => `<span class="capture-chip"><i class="fa-solid fa-check"></i> ${w}</span>`).join('');

  card.innerHTML = `
    <div class="capture-frame">
      <div class="capture-corner top-left"></div>
      <div class="capture-corner top-right"></div>
      <div class="capture-corner bottom-left"></div>
      <div class="capture-corner bottom-right"></div>

      <div class="capture-header">
        <img src="assets/logo/logo.png" alt="Logo CLB Lập Trình Trên Thiết Bị Di Động" class="capture-logo" />
        <div class="capture-header-text">
          <p class="capture-title">${GAME_NAME}</p>
          <p class="capture-competition">${COMPETITION_NAME}</p>
          <p class="capture-topic">${TOPIC}</p>
        </div>
        <div class="capture-badge">
          <span class="badge-text">VERIFIED</span>
          <span class="badge-sub">100% COMPLETE</span>
        </div>
      </div>

      <div class="capture-info-panel">
        <div class="capture-info-item">
          <span class="info-label">Họ và tên:</span>
          <span class="info-value highlight">${state.fullName}</span>
        </div>
        <div class="capture-info-item">
          <span class="info-label">Mã số sinh viên:</span>
          <span class="info-value highlight">${state.studentId}</span>
        </div>
        <div class="capture-info-item">
          <span class="info-label">Thời gian hoàn thành:</span>
          <span class="info-value">${winTimeStr}</span>
        </div>
      </div>

      <div class="capture-keywords">${keywordsHtml}</div>
      ${gridHtml}

      <div class="capture-footer">
        <div class="capture-security-code">
          <span class="security-label">MÃ XÁC THỰC:</span>
          <span class="security-hash">#${hash}</span>
        </div>
        <span class="capture-watermark">CLB Lập Trình Trên Thiết Bị Di Động &middot; MPC</span>
      </div>
    </div>
  `;

  document.body.appendChild(card);
  return card;
}

// Ten file dang "Minigame-Ho_Ten-MSSV.png", bo ky tu khong an toan cho ten file
function buildFileName(state) {
  const namePart = (state.fullName || 'Player')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '');
  return `Minigame-${namePart}-${state.studentId}.png`;
}

export async function exportResultImage(state, grid, placements, exportBtn) {
  const originalHTML = exportBtn ? exportBtn.innerHTML : '';
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Đang tạo ảnh...';
  }

  let card;
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const h2c = typeof html2canvas === 'function' ? html2canvas : (window.html2canvas || (window.html2canvas && window.html2canvas.default));
    if (!h2c) {
      throw new Error('Thư viện tạo ảnh chưa được tải thành công. Vui lòng kiểm tra kết nối mạng và tải lại trang.');
    }

    card = buildCaptureCard(state, grid, placements);
    const canvas = await h2c(card, {
      backgroundColor: '#0d0d14',
      scale: 2,
      useCORS: true,
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob trả về null'));
      }, 'image/png');
    });

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = buildFileName(state);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    return true;
  } catch (err) {
    await showModalAlert({
      title: 'Lỗi xuất ảnh',
      message: 'Không thể tạo ảnh minh chứng: ' + err.message,
      mascot: 'assets/mascot/mascot-cry.png',
      btnText: 'Đóng',
    });
    console.error('exportResultImage lỗi:', err);
    return false;
  } finally {
    if (card) card.remove();
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.innerHTML = originalHTML;
    }
  }
}
