export const GRID_SIZE = 9;

// TEST_MODE: bật/tắt chế độ thử nghiệm
// Khi TEST_MODE = true:
// - Click sound-btn-game 5 lần trong 5s: tự động giải toàn bộ minigame để chiến thắng
// - Click music-btn-game 5 lần trong 5s: mở khóa toàn bộ gợi ý từ khóa
export const TEST_MODE = false;

export const KEYWORDS_AND_HINTS = [
  { "keyword": "clinic", "description": "Doanh nghiệp sức khỏe & làm đẹp: phòng khám, thẩm mỹ viện — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "school", "description": "Doanh nghiệp giáo dục & đào tạo: trường, trung tâm dạy học — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "food", "description": "Doanh nghiệp ẩm thực: nhà hàng, chuỗi quán ăn — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "travel", "description": "Doanh nghiệp du lịch: công ty lữ hành, tour — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "house", "description": "Doanh nghiệp bất động sản: dự án nhà ở, căn hộ — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "software", "description": "Doanh nghiệp phần mềm: giải pháp và sản phẩm công nghệ — một trong 6 lĩnh vực bốc thăm năm nay!" },
  { "keyword": "fashion", "description": "Doanh nghiệp thời trang: thương hiệu quần áo, giày dép, phụ kiện." },
  { "keyword": "photo", "description": "Doanh nghiệp nhiếp ảnh: studio chụp ảnh cưới, kỷ yếu, sản phẩm." },
  { "keyword": "game", "description": "Doanh nghiệp studio game: công ty phát triển trò chơi điện tử." },
  { "keyword": "sport", "description": "Doanh nghiệp thể thao: chuỗi phòng tập, cửa hàng dụng cụ thể thao." }
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
