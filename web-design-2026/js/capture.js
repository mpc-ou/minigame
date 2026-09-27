import { GAME_NAME, TOPIC, GRID_SIZE } from './config.js';
import { formatDateTime, generateHash } from './utils.js';
import { showModalAlert } from './modal.js';

const CAPTURE_BG = 'assets/bg.jpg';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

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

  const topic = TOPIC.replace(/^Chủ đề:\s*/i, '');

  card.innerHTML = `
    <img src="${CAPTURE_BG}" alt="" class="capture-bg" />
    <div class="capture-content">
      <div class="capture-heading">
        <p class="capture-title">MINIGAME</p>
        <p class="capture-subtitle">
          <span class="capture-subtitle-line"></span>
          <span>${escapeHtml(topic)}</span>
          <span class="capture-subtitle-line"></span>
        </p>
      </div>

      <div class="capture-board">
        <div class="capture-board-head">
          <span class="capture-board-name">${escapeHtml(GAME_NAME)}</span>
          <span class="capture-badge"><i class="fa-solid fa-circle-check"></i> ${keywordsList.length}/${keywordsList.length}</span>
        </div>
        ${gridHtml}
      </div>

      <div class="capture-player">
        <p class="capture-name">${escapeHtml(state.fullName)}</p>
        <p class="capture-meta">
          <span>MSSV ${escapeHtml(state.studentId)}</span>
          <span class="capture-dot">&bull;</span>
          <span>${winTimeStr}</span>
          <span class="capture-dot">&bull;</span>
          <span class="capture-hash">#${hash}</span>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(card);
  return card;
}

async function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', () => reject(new Error(`Không tải được ảnh ${img.getAttribute('src')}`)), { once: true });
    });
  }));
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
    await waitForImages(card);
    const canvas = await h2c(card, {
      backgroundColor: '#0a0706',
      width: 540,
      height: 720,
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
