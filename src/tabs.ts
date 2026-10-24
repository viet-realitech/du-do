import { $, clearLayer } from './ui/dom';
import { ac } from './audio';
import { renderMain } from './view';
import { paneFig } from './screens/figures';
import { paneSrc } from './screens/sources';
import { paneMe } from './screens/profile';

export type TabId = 'map' | 'fig' | 'src' | 'me';

export function setTab(t: TabId): void {
  document.querySelectorAll<HTMLElement>('.tab').forEach(b => {
    const on = b.dataset.t === t;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (t === 'map') { clearLayer(); renderMain(); }
  else if (t === 'src') paneSrc();
  else if (t === 'fig') paneFig();
  else paneMe();
}

export function initTabs(): void {
  $('#tabs')!.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('.tab');
    if (!b) return;
    ac();
    setTab(b.dataset.t as TabId);
  });
}
