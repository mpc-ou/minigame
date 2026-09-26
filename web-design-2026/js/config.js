export const GRID_SIZE = 10;

export const KEYWORDS_AND_HINTS = [
  { "keyword": "header", "description": "Phần trên cùng của trang web, thường chứa logo và menu." },
  { "keyword": "menu", "description": "Danh sách các mục để chọn và chuyển đến những trang khác nhau trên website." },
  { "keyword": "logo", "description": "Biểu tượng nhận diện thương hiệu của công ty hoặc website." },
  { "keyword": "banner", "description": "Biểu ngữ hình ảnh lớn, nổi bật, dùng để quảng cáo hoặc truyền tải thông điệp." },
  { "keyword": "slider", "description": "Khu vực hình ảnh tự động chuyển qua lại, có thể vuốt hoặc bấm mũi tên để xem tiếp." },
  { "keyword": "search", "description": "Ô tìm kiếm để gõ từ khóa và tra cứu nhanh nội dung." },
  { "keyword": "button", "description": "Nút bấm để thực hiện một hành động như gửi, mua hàng hoặc đăng nhập." },
  { "keyword": "link", "description": "Đường dẫn khi bấm vào sẽ mở ra một trang hoặc nội dung khác." },
  { "keyword": "icon", "description": "Hình biểu tượng nhỏ đại diện cho một chức năng, như hình giỏ hàng hay cái chuông." },
  { "keyword": "tab", "description": "Các thẻ chuyển đổi giúp xem từng nhóm nội dung khác nhau trên cùng một trang." },
  { "keyword": "popup", "description": "Cửa sổ nhỏ bất ngờ hiện lên che trên trang để thông báo hoặc mời bạn thao tác." },
  { "keyword": "form", "description": "Biểu mẫu có các ô để điền thông tin như họ tên, email, số điện thoại." },
  { "keyword": "avatar", "description": "Ảnh đại diện của một tài khoản hoặc người dùng." },
  { "keyword": "footer", "description": "Phần cuối cùng của trang web, thường có thông tin liên hệ và bản quyền." }
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

export const HINT_INTERVAL_MS = 20000;
export const HINT_MASK_MIN_RATIO = 0.4;
export const HINT_MASK_MAX_RATIO = 0.5;

export const HINT_URGENT_THRESHOLD_S = 5;

export const GGFORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe4ubwjGmHkwZFagQP1rXfbZlXNT8X5yHG6kw94vG-YD8bVPw/viewform';