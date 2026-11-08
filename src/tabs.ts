import { endScene } from './scene';
import { $, clearLayer, ghost, layer, markTab } from './ui/dom';
import { ac, SND } from './audio';
import { renderMain } from './view';
import { paneFig } from './screens/figures';
import { paneSrc } from './screens/sources';
import { paneMe } from './screens/profile';

export type TabId = 'map' | 'fig' | 'src' | 'me';

export function setTab(t: TabId): void {
  if (t !== 'map') endScene(); // bảng phủ kín bản đồ: không để pháo nổ / máy rung phía sau (trước markTab: xem lại bị cắt tự đưa thanh tab về Bản đồ)
  markTab(t);
  ghost(...layer.children);
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
    if (!b.classList.contains('on')) SND.page();
    setTab(b.dataset.t as TabId);
  });
}
