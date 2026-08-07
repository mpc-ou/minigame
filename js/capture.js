// capture.js - Dung html2canvas de xuat anh ket qua
import { COMPETITION_NAME, KEYWORDS, GRID_SIZE } from './config.js';
import { formatDateTime, generateHash } from './utils.js';

function buildCaptureCard(state, grid, placements) {
  const card = document.createElement('div');
  card.id = 'capture-card';
  card.className = 'capture-card';
  card.style.setProperty('--grid-size', GRID_SIZE);

  const winTimeStr = formatDateTime(new Date(state.winTime));
  const hash = generateHash(`${state.fullName}|${state.studentId}|${state.winTime}`);

  // Tao tap hop toa do cac o dung de highlight xanh
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
        <p class="capture-title">${COMPETITION_NAME}</p>
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

export async function exportResultImage(state, grid, placements) {
  const exportBtn = document.getElementById('export-btn');
  const originalText = exportBtn ? exportBtn.textContent : '';
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Đang tạo ảnh...';
  }

  // Neu trinh duyet khong ho tro Web Share API (files), phai mo san 1 tab
  // trong ngay luc con "user gesture" - vi Safari/iOS se am tham chan
  // window.open neu goi sau cac buoc await cua html2canvas ben duoi.
  const supportsFileShare = typeof navigator.canShare === 'function';
  const preOpenedTab = supportsFileShare ? null : window.open('', '_blank');

  let card;
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    card = buildCaptureCard(state, grid, placements);
    const canvas = await html2canvas(card, {
      backgroundColor: '#0D0D0D',
      scale: 2,
      useCORS: true,
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob trả về null'));
      }, 'image/png');
    });

    const fileName = `WebDesign2026_${state.studentId}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    if (supportsFileShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Kết quả Web-Design 2026' });
        return;
      } catch (shareError) {
        if (shareError.name === 'AbortError') return;
        throw shareError;
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    if (preOpenedTab) {
      preOpenedTab.location.href = blobUrl;
    } else {
      window.open(blobUrl, '_blank');
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    if (preOpenedTab) preOpenedTab.close();
    alert('Lỗi khi xuất ảnh: ' + err.message);
    console.error('exportResultImage lỗi:', err);
  } finally {
    if (card) card.remove();
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.textContent = originalText;
    }
  }
}