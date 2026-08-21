/**
 * Centralized Game Text Strings & Content Configuration
 */

export const TEXTS = {
  GAME_NAME: 'Word Hunt Game',
  COMPETITION_NAME: 'WEB-DESIGN 2026',
  TOPIC: 'Chủ đề: Thành phần Giao diện Web (UI/UX)',

  COVER: {
    STATUS_WIN: 'Bạn đã hoàn thành ván trước - bấm Chơi để xem lại kết quả.',
    STATUS_IN_PROGRESS: (found, total) => `Đang chơi dở: ${found}/${total} từ khóa.`,
    STATUS_READY: 'Sẵn sàng bắt đầu.',
    BTN_PLAY: 'Chơi',
    BTN_RESET: 'Xóa kết quả',
  },

  HINTS: {
    READY_TEXT: '💡 Gợi ý?',
    EXHAUSTED_TEXT: 'Hết gợi ý ✨',
    COUNTDOWN_SUFFIX: 's',
  },

  MODALS: {
    RESET_CONFIRM: {
      title: 'Bắt đầu ván mới?',
      message: 'Hành động này sẽ xóa toàn bộ tiến trình hiện tại và tạo một ma trận mới.',
      confirmText: 'Xóa & Bắt đầu lại',
      cancelText: 'Quay lại',
    },
    VICTORY: {
      title: 'Chúc mừng!',
      text: 'Bạn đã hoàn thành thử thách. Bấm "Lưu minh chứng" bên dưới để lưu kết quả.',
      closeBtn: 'Đóng',
    },
    INFO_FORM: {
      title: 'Lưu minh chứng',
      text: 'Nhập họ tên và MSSV. Thông tin này chỉ được nhập 1 lần cho mỗi lượt chơi.',
      errNameRequired: 'Vui lòng nhập họ và tên.',
      errStudentIdInvalid: 'Mã số sinh viên phải gồm từ 7 đến 12 chữ số, không chứa chữ cái.',
    },
  },

  POST_WIN: {
    PROMPT_SUBMIT_INFO: 'Nhập họ tên & MSSV để xuất ảnh minh chứng.',
    SAVED_SUCCESS: 'Đã lưu kết quả thành công! Bạn có thể xuất lại ảnh hoặc nộp form bên dưới.',
    BTN_SAVE_PROOF: 'Lưu minh chứng',
    BTN_EXPORT_IMAGE: 'Xuất ảnh',
    BTN_EXPORTED_IMAGE: 'Đã xuất ảnh',
    BTN_GGFORM: 'Nộp minh chứng (Google Form)',
    BTN_PLAY_AGAIN: 'Xóa kết quả / Chơi lại',
  },

  DEFAULT_GUIDE_HTML: `<h3>Cách chơi</h3>
<ol>
    <li>Tap vào 1 ô chữ để bắt đầu, tap tiếp ô cuối cùng của từ để chọn cả chuỗi - đọc theo các hướng: Ngang (→), Dọc (↓), Chéo (↘).</li>
    <li>Tap lại vào ô đang chọn để bỏ chọn ô đó và các ô phía sau trong chuỗi.</li>
    <li><strong>Ma trận &amp; Đáp án ngẫu nhiên:</strong> Ma trận ô chữ và bộ từ khóa được hệ thống sinh ngẫu nhiên cho từng người chơi và từng lượt chơi mới (vị trí từ khóa và bộ đáp án của mỗi người đều khác nhau).</li>
    <li>Có 5 từ khóa ẩn trong ma trận. Còn từ nào chưa tìm ra thì cứ 30 giây trôi qua, chú cáo sẽ hé lộ ký tự để gợi ý.</li>
    <li>Tìm đủ 5/5 từ khóa để hoàn thành thử thách.</li>
</ol>
<h3>Lưu &amp; nộp minh chứng</h3>
<ol>
    <li>Sau khi thắng, bấm <strong>"Lưu minh chứng"</strong> và nhập đúng Họ tên + Mã số sinh viên (chỉ nhập được 1 lần cho mỗi lượt chơi, nên gõ cẩn thận).</li>
    <li>Bấm <strong>"Xuất ảnh"</strong> để tải ảnh minh chứng (định dạng PNG) về máy - có thể bấm xuất lại bất cứ lúc nào nếu lỡ làm mất ảnh.</li>
    <li>Nếu màn hình có nút <strong>"Nộp minh chứng"</strong>, bấm vào để nộp trực tiếp qua Google Form của CLB. Nếu chưa thấy nút này, hãy gửi ảnh minh chứng (kèm Họ tên, MSSV) cho Ban tổ chức CLB Lập Trình Trên Thiết Bị Di Động qua kênh liên hệ chính thức để được cộng điểm rèn luyện (DRL).</li>
</ol>
<div class="guide-credit">
    <span>Credit:</span>
    <a href="https://github.com/BapDev06" target="_blank" rel="noopener noreferrer" class="credit-author">
        <i class="fa-brands fa-github"></i> BapDev06
    </a>
</div>`,
};
