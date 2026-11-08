// Only the latin + vietnamese subsets: everything the UI writes, without precaching cyrillic/greek/latin-ext.
import '@fontsource/eb-garamond/latin-400';
import '@fontsource/eb-garamond/vietnamese-400';
import '@fontsource/eb-garamond/latin-500';
import '@fontsource/eb-garamond/vietnamese-500';
import '@fontsource/eb-garamond/latin-600';
import '@fontsource/eb-garamond/vietnamese-600';
import '@fontsource/eb-garamond/latin-400-italic';
import '@fontsource/eb-garamond/vietnamese-400-italic';
import '@fontsource/eb-garamond/latin-500-italic';
import '@fontsource/eb-garamond/vietnamese-500-italic';
import '@fontsource/big-shoulders-display/latin-600';
import '@fontsource/big-shoulders-display/vietnamese-600';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/vietnamese-700';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/big-shoulders-display/vietnamese-800';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/big-shoulders-display/vietnamese-900';
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
import { registerSW } from 'virtual:pwa-register';
import { ERAS } from './data';
import { S, setFocus, save, evEra } from './state';
import { initMap } from './map';
import { initMainControls, renderMain, setYear } from './view';
import { initTabs } from './tabs';
import { initHistory } from './ui/history';
import { togglePlay, startTour } from './tour';
import { pendingCard } from './play';
import { ac } from './audio';
import { applyTheme } from './theme';
import { initMusic, mood } from './music';
import { splash, intro, gameIntro } from './screens/onboarding';
import './screens/event';
import './screens/card';
import './screens/profile';
import './screens/ending';

initMainControls();
initTabs();
initHistory();
initMusic();
mood('calm');
document.getElementById('play')!.addEventListener('click', () => { ac(); togglePlay(); });
setFocus();
applyTheme(); // also renders the main screen
const mapReady = initMap().then(renderMain);

// iOS leaves the page scrolled after the keyboard closes; the app never scrolls as a document.
addEventListener('focusout', () => setTimeout(() => { if (scrollX || scrollY) scrollTo(0, 0); }, 60));

if (S.step === 'splash') splash();
else if (S.step === 'intro') (S.mode === 'play' ? gameIntro : intro)();
else {
  // Trò chơi: tải lại giữa chương với thẻ bắt buộc đang chờ (của một chương trước điểm rẽ còn bỏ ngỏ, kể cả Điện Biên Phủ
  // cùng năm 1954 với điểm rẽ 5) → dựng lại tour chương từ sự kiện đó (bay tới, cảnh, lời kể, rồi mới mở thẻ), không bật
  // liền các thẻ còn lại trên bản đồ đứng yên. Không thì điểm rẽ chưa chọn.
  const pc = S.mode === 'play' ? pendingCard(S.year) : undefined, pend = ERAS.find(e => !S.picks[e.id] && e.cy <= S.year);
  if (pc && (!pend || ERAS.indexOf(evEra(pc)) < ERAS.indexOf(pend))) {
    S.year = pc.y;
    save();
    void mapReady.then(() => { if (!document.querySelector('#layer > *')) startTour(evEra(pc)); });
  } else if (pend) setYear(S.year, true);
}

registerSW({ immediate: true });
