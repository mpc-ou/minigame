export const GRID_SIZE = 10;

export const KEYWORDS_AND_HINTS = [
  {
    "keyword": "navbar",
    "description": "Thanh điều hướng đầu trang chứa menu và logo giúp chuyển trang nhanh chóng."
  },
  {
    "keyword": "banner",
    "description": "Biểu ngữ hình ảnh nổi bật ở đầu trang dùng để truyền tải thông điệp quan trọng."
  },
  {
    "keyword": "modal",
    "description": "Hộp thoại pop-up xuất hiện đè lên giao diện chính để thông báo hoặc yêu cầu tương tác."
  },
  {
    "keyword": "button",
    "description": "Nút bấm kích hoạt hành động như gửi dữ liệu, mở trang hoặc tương tác."
  },
  {
    "keyword": "sidebar",
    "description": "Thanh phụ nằm ở cạnh bên dùng để hiển thị menu hoặc bộ lọc tìm kiếm."
  },
  {
    "keyword": "footer",
    "description": "Phần chân trang ở cuối website chứa bản quyền, liên hệ và liên kết hữu ích."
  },
  {
    "keyword": "avatar",
    "description": "Hình ảnh đại diện cho tài khoản hoặc người dùng trên giao diện web."
  },
  {
    "keyword": "card",
    "description": "Thẻ hiển thị nội dung được đóng gói gọn gàng gồm ảnh, tiêu đề và tóm tắt."
  },
  {
    "keyword": "search",
    "description": "Ô tìm kiếm giúp người dùng tra cứu nhanh nội dung trên website."
  },
  {
    "keyword": "badge",
    "description": "Huy hiệu nhỏ hiển thị nhãn trạng thái, số lượng thông báo hoặc cấp bậc."
  }
];

export const NUMBER_KEYWORD = 5;

export function selectRandomKeywords(count = NUMBER_KEYWORD) {
  const pool = KEYWORDS_AND_HINTS.map((item) => ({
    keyword: item.keyword.trim().toUpperCase(),
    description: item.desciption || item.description || '',
  }));
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

import { TEXTS } from './texts.js';
export { TEXTS };

export const GAME_NAME = TEXTS.GAME_NAME;
export const COMPETITION_NAME = TEXTS.COMPETITION_NAME;
export const TOPIC = TEXTS.TOPIC;

export const DIRECTIONS = [
  { dr: 0, dc: 1 },   // trai -> phai
  { dr: 1, dc: 0 },   // tren -> duoi
  { dr: 1, dc: 1 },   // cheo xuong-phai
  // { dr: 1, dc: -1 },  // cheo xuong-trai
];

export const STORAGE_KEY = 'webdesign2026_wordsearch_state';

export const MAX_PLACEMENT_ATTEMPTS = 200;
export const MAX_MATRIX_REGENERATE = 50;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const HINT_INTERVAL_MS = 30000;
export const HINT_MASK_MIN_RATIO = 0.4;
export const HINT_MASK_MAX_RATIO = 0.5;

export const HINT_URGENT_THRESHOLD_S = 5;

export const GGFORM_URL = 'https://www.mpclub.dev';