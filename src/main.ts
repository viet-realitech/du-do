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
import '@fontsource/ibm-plex-mono/latin-400';
import '@fontsource/ibm-plex-mono/vietnamese-400';
import '@fontsource/ibm-plex-mono/latin-500';
import '@fontsource/ibm-plex-mono/vietnamese-500';
import './styles.css';
import './ui/image-slot';
import { registerSW } from 'virtual:pwa-register';
import { ERAS } from './data';
import { S, setFocus } from './state';
import { initMap } from './map';
import { initMainControls, renderMain, setYear } from './view';
import { initTabs } from './tabs';
import { initHistory } from './ui/history';
import { isTouring, startTour, stopTour } from './tour';
import { ac } from './audio';
import { initMusic, mood } from './music';
import { splash, intro } from './screens/onboarding';
import './screens/event';
import './screens/profile';
import './screens/ending';

initMainControls();
initTabs();
initHistory();
initMusic();
mood('calm');
document.getElementById('play')!.addEventListener('click', () => { ac(); if (isTouring()) stopTour(); else startTour(); });
setFocus();
renderMain();
initMap().then(renderMain);

// iOS leaves the page scrolled after the keyboard closes; the app never scrolls as a document.
addEventListener('focusout', () => setTimeout(() => { if (scrollX || scrollY) scrollTo(0, 0); }, 60));

if (S.step === 'splash') splash();
else if (S.step === 'intro') intro();
else if (ERAS.find(e => !S.picks[e.id] && e.cy <= S.year)) setYear(S.year, true);

registerSW({ immediate: true });
