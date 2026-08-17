import { showDialog, hideDialog } from './animation.js';

export function showModalAlert(options) {
  return new Promise((resolve) => {
    const title = typeof options === 'string' ? 'Thông báo' : (options.title || 'Thông báo');
    const message = typeof options === 'string' ? options : (options.message || '');
    const mascot = (typeof options === 'object' && options.mascot) || 'assets/mascot/mascot-idle.png';
    const btnText = (typeof options === 'object' && options.btnText) || 'Đã hiểu';

    const modalEl = document.getElementById('custom-modal');
    const titleEl = document.getElementById('custom-modal-title');
    const textEl = document.getElementById('custom-modal-text');
    const mascotEl = document.getElementById('custom-modal-mascot');
    const actionsEl = document.getElementById('custom-modal-actions');

    if (!modalEl) {
      window.alert(message);
      resolve();
      return;
    }

    titleEl.textContent = title;
    textEl.textContent = message;
    mascotEl.src = mascot;
    actionsEl.innerHTML = '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-primary';
    btn.textContent = btnText;
    btn.onclick = () => {
      hideDialog(modalEl);
      resolve();
    };

    actionsEl.appendChild(btn);
    showDialog(modalEl);
  });
}

export function showModalConfirm(options) {
  return new Promise((resolve) => {
    const title = typeof options === 'string' ? 'Xác nhận' : (options.title || 'Xác nhận');
    const message = typeof options === 'string' ? options : (options.message || '');
    const mascot = (typeof options === 'object' && options.mascot) || 'assets/mascot/mascot-cry.png';
    const confirmText = (typeof options === 'object' && options.confirmText) || 'Đồng ý';
    const cancelText = (typeof options === 'object' && options.cancelText) || 'Hủy';
    const isDanger = typeof options === 'object' ? options.danger !== false : true;

    const modalEl = document.getElementById('custom-modal');
    const titleEl = document.getElementById('custom-modal-title');
    const textEl = document.getElementById('custom-modal-text');
    const mascotEl = document.getElementById('custom-modal-mascot');
    const actionsEl = document.getElementById('custom-modal-actions');

    if (!modalEl) {
      const res = window.confirm(message);
      resolve(res);
      return;
    }

    titleEl.textContent = title;
    textEl.textContent = message;
    mascotEl.src = mascot;
    actionsEl.innerHTML = '';

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = isDanger ? 'btn-danger' : 'btn-primary';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      hideDialog(modalEl);
      resolve(true);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-close';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      hideDialog(modalEl);
      resolve(false);
    };

    actionsEl.appendChild(confirmBtn);
    actionsEl.appendChild(cancelBtn);
    showDialog(modalEl);
  });
}
