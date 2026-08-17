import { GAME_NAME, COMPETITION_NAME, KEYWORDS, GRID_SIZE } from './config.js';
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

  const keywordsHtml = KEYWORDS.map((w) => `<span class="capture-chip">${w}</span>`).join('');

  card.innerHTML = `
    <div class="capture-header">
       <img src="assets/logo/logo.png" alt="Logo CLB Lập Trình Trên Thiết Bị Di Động" class="capture-logo" />
      <div>
        <p class="capture-title">${GAME_NAME}</p>
        <p class="capture-competition">${COMPETITION_NAME}</p>
        <p class="capture-subtitle">Minh chứng hoàn thành thử thách</p>
      </div>
    </div>
    <div class="capture-info">
      <p><strong>Họ và tên:</strong> ${state.fullName}</p>
      <p><strong>Mã số sinh viên:</strong> ${state.studentId}</p>
      <p><strong>Thời gian hoàn thành:</strong> ${winTimeStr}</p>
    </div>
    <div class="capture-keywords">${keywordsHtml}</div>
    ${gridHtml}
    <div class="capture-footer">
      <span>Mã xác thực: #${hash}</span>
      <span class="capture-watermark">WEB-DESIGN 2026 &middot; CLB Lập Trình Trên Thiết Bị Di Động</span>
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

    card = buildCaptureCard(state, grid, placements);
    const canvas = await html2canvas(card, {
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
