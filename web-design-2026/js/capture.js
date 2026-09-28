import { GAME_NAME, TOPIC, GRID_SIZE } from './config.js';
import { formatDateTime, generateHash } from './utils.js';
import { showModalAlert } from './modal.js';
import { showDialog, hideDialog } from './animation.js';
import { TEXTS } from './texts.js';

const CAPTURE_BG = 'assets/bg.jpg';

let cachedProofData = null;

export function getCachedProof() {
  return cachedProofData;
}

export function setCachedProof(data) {
  cachedProofData = data;
}

export function isFBOrInAppBrowser() {
  if (typeof window !== 'undefined' && window.location.search.includes('fb=1')) {
    return true;
  }
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  return (
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('fb_iab') ||
    ua.includes('fb4a') ||
    ua.includes('fbios') ||
    ua.includes('messenger') ||
    ua.includes('instagram') ||
    ua.includes('zalo') ||
    ua.includes('tiktok') ||
    ua.includes('line')
  );
}

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
    const loadPromise = (img.complete && img.naturalWidth > 0)
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', () => reject(new Error(`Không tải được ảnh ${img.getAttribute('src')}`)), { once: true });
      });

    return loadPromise.then(() => {
      if (typeof img.decode === 'function') {
        return img.decode().catch(() => { });
      }
    });
  }));
}

export function buildFileName(state) {
  const namePart = (state.fullName || 'Player')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '');
  return `Minigame-${namePart}-${state.studentId}.png`;
}

export async function generateProofImage(state, grid, placements) {
  let card = null;
  try {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }

    const h2c = typeof html2canvas === 'function' ? html2canvas : (window.html2canvas || (window.html2canvas && window.html2canvas.default));
    if (!h2c) {
      throw new Error('Thư viện tạo ảnh chưa được tải thành công. Vui lòng kiểm tra kết nối mạng và tải lại trang.');
    }

    card = buildCaptureCard(state, grid, placements);
    await waitForImages(card);

    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 80)));

    const canvas = await h2c(card, {
      backgroundColor: '#0a0706',
      width: 540,
      height: 720,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: 540,
      windowHeight: 720,
    });

    const dataUrl = canvas.toDataURL('image/png');
    let blob = null;
    let blobUrl = null;
    try {
      blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('canvas.toBlob trả về null'));
        }, 'image/png');
      });
      if (blob) {
        blobUrl = URL.createObjectURL(blob);
      }
    } catch (_) { }

    const proofData = { dataUrl, blob, blobUrl, state };
    setCachedProof(proofData);
    return { success: true, ...proofData };
  } catch (err) {
    console.error('generateProofImage lỗi:', err);
    return { success: false, error: err, state };
  } finally {
    if (card) card.remove();
  }
}

export async function openProofDialog(dom, proofData, { showAlert = false, alertTitle, alertMessage } = {}) {
  if (!dom || !dom.proofDialogEl) return;

  if (dom.proofImgEl) {
    dom.proofImgEl.src = proofData.dataUrl || proofData.blobUrl || '';
    dom.proofImgEl.onclick = (e) => {
      e.stopPropagation();
    };
  }

  // Bấm nền đen (phần ngoài ảnh) sẽ lặn đi
  dom.proofDialogEl.onclick = (e) => {
    if (e.target !== dom.proofImgEl) {
      hideDialog(dom.proofDialogEl);
    }
  };

  // Show the proof dialog with image on screen
  showDialog(dom.proofDialogEl);

  // If showAlert requested, display the alert modal on top
  if (showAlert) {
    await showModalAlert({
      title: alertTitle || TEXTS.MODALS.FB_BROWSER_ALERT.title,
      message: alertMessage || TEXTS.MODALS.FB_BROWSER_ALERT.message,
      mascot: 'assets/mascot/mascot-idle.png',
      btnText: 'Đã hiểu, xem ảnh',
    });
  }
}

export async function exportResultImage(state, grid, placements, exportBtn, dom) {
  const originalHTML = exportBtn ? exportBtn.innerHTML : '';
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Đang tạo ảnh...';
  }

  try {
    const proofResult = await generateProofImage(state, grid, placements);
    if (!proofResult.success) {
      await showModalAlert({
        title: 'Lỗi xuất ảnh',
        message: 'Không thể tạo ảnh minh chứng: ' + (proofResult.error?.message || 'Lỗi không xác định') + '. Vui lòng chụp màn hình giao diện hiện tại để làm minh chứng!',
        mascot: 'assets/mascot/mascot-cry.png',
        btnText: 'Đã hiểu',
      });
      return false;
    }

    const inApp = isFBOrInAppBrowser();

    if (inApp && dom && dom.proofDialogEl) {
      // In Facebook / In-App browser: file download is blocked
      // Show proof dialog on screen + alert asking user to screenshot!
      await openProofDialog(dom, proofResult, {
        showAlert: true,
        alertTitle: TEXTS.MODALS.FB_BROWSER_ALERT.title,
        alertMessage: TEXTS.MODALS.FB_BROWSER_ALERT.message,
      });
      return true;
    }

    // Normal browser: try direct download
    let downloadSucceeded = false;
    try {
      const link = document.createElement('a');
      link.href = proofResult.blobUrl || proofResult.dataUrl;
      link.download = buildFileName(state);
      document.body.appendChild(link);
      link.click();
      link.remove();
      downloadSucceeded = true;
    } catch (dlErr) {
      console.warn('Auto download failed:', dlErr);
      downloadSucceeded = false;
    }

    if (!downloadSucceeded && dom && dom.proofDialogEl) {
      await openProofDialog(dom, proofResult, {
        showAlert: true,
        alertTitle: TEXTS.MODALS.EXPORT_FALLBACK_ALERT.title,
        alertMessage: TEXTS.MODALS.EXPORT_FALLBACK_ALERT.message,
      });
      return true;
    }

    return true;
  } catch (err) {
    console.error('exportResultImage unexpected error:', err);
    await showModalAlert({
      title: 'Lỗi xuất ảnh',
      message: 'Không thể tạo ảnh minh chứng: ' + err.message,
      mascot: 'assets/mascot/mascot-cry.png',
      btnText: 'Đóng',
    });
    return false;
  } finally {
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.innerHTML = originalHTML;
    }
  }
}
