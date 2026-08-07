// storage.js - Noi duy nhat duoc phep goi localStorage
//API cua trinh duyet 
import { STORAGE_KEY } from './config.js';

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); //chuyển chuỗi state thành JSON trước khi lưu vào localStorage. 
    // Nếu state là một object, 
    // JSON.stringify sẽ chuyển nó thành chuỗi JSON.
    return true;
  } catch (e) {
    console.error('Khong the luu trang thai:', e);
    return false;
  }
}

export function loadState() { 
  try {
    const raw = localStorage.getItem(STORAGE_KEY); //lấy dữ liệu từ localStorage theo key STORAGE_KEY. Nếu không tìm thấy, raw sẽ là null.
    return raw ? JSON.parse(raw) : null; //Nếu raw là null (không tìm thấy key trong localStorage), trả về null.
  } catch (e) {
    console.error('Khong the doc trang thai:', e);
    return null;
  }
}

//try...catch được sử dụng để bắt lỗi khi thao tác với localStorage. Nếu trình duyệt không hỗ trợ localStorage hoặc có lỗi khác,
// catch sẽ bắt lỗi và in ra thông báo lỗi, thay vì làm sập ứng dụng.

export function clearState() { //Xóa dữ liệu trong localStorage theo key STORAGE_KEY. Nếu key không tồn tại, hàm này sẽ không gây lỗi.
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialState(fullName, studentId) { //hàm tạo trạng thái ban đầu của trò chơi, được gọi khi người dùng bắt đầu chơi lần đầu tiên.
  return {
    fullName,
    studentId,
    startTime: Date.now(),
    winTime: null,
    isWin: false,
    foundKeywords: [],
    matrixSeed: null, // se duoc gan sau khi generate matrix
  };
}