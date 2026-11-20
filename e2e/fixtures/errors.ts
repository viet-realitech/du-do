/** WebKit báo một lỗi trang khi lần tải nhạc đang dở (fetch, src/music.ts) bị cắt vì trang tải lại hay đi trang khác:
    "Fetch API cannot load …/music/calm-….m4a due to access control checks." Trang không thấy lỗi nào (không có
    unhandledrejection), người chơi không nghe gì khác: bài thử gom lỗi trang rồi tải lại không tính lỗi này. */
export const navCut = (msg: string): boolean => /\/music\/\S+ due to access control checks/.test(msg);
