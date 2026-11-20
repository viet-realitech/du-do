// sổ lỗi trên máy trước mọi mô-đun khác: bắt cả lỗi lúc chúng chạy (bảng chẩn đoán, ui/debug.ts)
import { note } from './errlog';
// Only the latin + vietnamese subsets: everything the UI writes, without precaching cyrillic/greek/latin-ext.
import '@fontsource/eb-garamond/latin-400';
import '@fontsource/eb-garamond/vietnamese-400';
import '@fontsource/eb-garamond/latin-500';
import '@fontsource/eb-garamond/vietnamese-500';
import '@fontsource/eb-garamond/latin-600';
import '@fontsource/eb-garamond/vietnamese-600';
// Đèn dầu (night) dựng tít bằng chính EB Garamond: 700 / 800 thật cho tít, số liệu đậm (không để trình duyệt tự tô đậm)
import '@fontsource/eb-garamond/latin-700';
import '@fontsource/eb-garamond/vietnamese-700';
import '@fontsource/eb-garamond/latin-800';
import '@fontsource/eb-garamond/vietnamese-800';
import '@fontsource/eb-garamond/latin-400-italic';
import '@fontsource/eb-garamond/vietnamese-400-italic';
import '@fontsource/eb-garamond/latin-500-italic';
import '@fontsource/eb-garamond/vietnamese-500-italic';
// Lưu trữ / Áp phích theme faces: only downloaded when that theme is in use.
import '@fontsource/playfair-display/latin-500';
import '@fontsource/playfair-display/vietnamese-500';
import '@fontsource/playfair-display/latin-700';
import '@fontsource/playfair-display/vietnamese-700';
import '@fontsource/playfair-display/latin-800';
import '@fontsource/playfair-display/vietnamese-800';
import '@fontsource/playfair-display/latin-500-italic';
import '@fontsource/playfair-display/vietnamese-500-italic';
import '@fontsource/be-vietnam-pro/latin-400';
import '@fontsource/be-vietnam-pro/vietnamese-400';
// Áp phích: chữ nghiêng thật cho ghi chú bên lề, lời kết cục (trình duyệt không phải tự xiên chữ đứng)
import '@fontsource/be-vietnam-pro/latin-400-italic';
import '@fontsource/be-vietnam-pro/vietnamese-400-italic';
import '@fontsource/be-vietnam-pro/latin-500';
import '@fontsource/be-vietnam-pro/vietnamese-500';
import '@fontsource/be-vietnam-pro/latin-600';
import '@fontsource/be-vietnam-pro/vietnamese-600';
import '@fontsource/be-vietnam-pro/latin-700';
import '@fontsource/be-vietnam-pro/vietnamese-700';
import '@fontsource/be-vietnam-pro/latin-800';
import '@fontsource/be-vietnam-pro/vietnamese-800';
import '@fontsource/be-vietnam-pro/latin-900';
import '@fontsource/be-vietnam-pro/vietnamese-900';
import '@fontsource/ibm-plex-mono/latin-400';
import '@fontsource/ibm-plex-mono/vietnamese-400';
import '@fontsource/ibm-plex-mono/latin-500';
import '@fontsource/ibm-plex-mono/vietnamese-500';
import './styles.css';
import './ui/image-slot';
import { initPwa } from './pwa';
import { S, setFocus, saveNotes } from './state';
import { boot } from './boot';
import { initMap } from './map';
import { initMainControls, renderMain } from './view';
import { initTabs } from './tabs';
import { initHistory } from './ui/history';
import { togglePlay } from './tour';
import { ac } from './audio';
import { applyTheme } from './theme';
import { initMusic, mood } from './music';
import { splash, intro, gameIntro, resumePlace } from './screens/onboarding';
import { learnVsync } from './ui/quality';
import './screens/event';
import './screens/card';
import './screens/profile';
import './screens/ending';

// lưới an toàn lúc khởi động (public/boot.js): mã ứng dụng đã chạy tới đây (bản lưu đã đọc xong)
const B = boot();
B?.started();
// ghi chú về bản lưu lúc mở (đã sửa gì, đã cất bản sao nào) vào sổ lỗi trên máy
saveNotes.sink = note;
saveNotes.list.splice(0).forEach(note);

initMainControls();
initTabs();
initHistory();
initMusic();
mood('calm');
document.getElementById('play')!.addEventListener('click', () => { ac(); togglePlay(); });
setFocus();
applyTheme(); // also renders the main screen
const mapReady = initMap().then(renderMain);
void mapReady.then(() => setTimeout(learnVsync, 1500)); // nhịp khung hình chuẩn của màn này (60 / 120 Hz), đo lúc đã yên

// iOS leaves the page scrolled after the keyboard closes; the app never scrolls as a document.
addEventListener('focusout', () => setTimeout(() => { if (scrollX || scrollY) scrollTo(0, 0); }, 60));

if (S.step === 'splash') splash();
else if (S.step === 'intro') (S.mode === 'play' ? gameIntro : intro)();
else resumePlace(mapReady); // thẻ còn nợ / điểm rẽ (Trò chơi), hay ▶ nhấp nháy mời chạy tiếp chương

initPwa(); // bản mới: kiểm tra khi quay lại app, chỉ tải lại lúc an toàn (pwa.ts)
// bảng chẩn đoán (?debug, hay chạm 5 lần vào dòng phiên bản ở Giới thiệu): chỉ tải khi được mở
try { if (/[?&]debug\b/.test(location.search) || sessionStorage.getItem('dudo-debug')) void import('./ui/debug').then(m => m.openDebug()); } catch { /* riêng tư */ }
// khởi động xong phần đồng bộ; bản đồ chính vẽ được thì từ đây lỗi chỉ ghi sổ, không vẽ được thì mở màn khôi phục
B?.booted();
void mapReady.then(() => B?.ready(), (e: unknown) => B?.fail(e instanceof Error ? `${e.name}: ${e.message}` : String(e)));
