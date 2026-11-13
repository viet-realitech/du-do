import { BADGES } from './data';
import { S, save, picked, matchStats, quizCorrect } from './state';
import { toast, whenClear } from './ui/dom';
import { SND, buzz } from './audio';

function badgeState(): Record<string, boolean> {
  const ms = matchStats(), tags = new Set(picked().map(o => o.tag).filter(t => t !== 'giunep')); // ba kiểu: đấu tranh, cải cách, hoà hoãn
  const real = S.seen.filter(i => !i.startsWith('d-')).length;
  return {
    start: S.step === 'play', r10: real >= 10, r40: real >= 40, s5: S.srcSeen.length >= 5, pv10: S.pvSeen.length >= 10,
    q6: quizCorrect() >= 6, q12: quizCorrect() >= 12, tags: tags.size === 3, against: ms.ag >= 3, match: ms.m === 5,
    map: S.zoomed && S.mapTapped, fig8: S.figSeen.length >= 8, diary: S.seen.filter(i => i.startsWith('d-')).length >= 6,
    done: S.ended, share: S.shared,
  };
}

/* Thông báo huy hiệu: chờ màn điện ảnh / tít mở trận chiếu xong và chờ người chơi quyết xong điểm rẽ / thẻ đang mở
   (không che tiêu đề, không chen tiếng kèn vào lời dẫn). Nhiều huy hiệu cùng lúc (cuối hành trình) gộp thành một thông
   báo thay vì ba cái nối nhau; hàng đợi trong ui/dom.ts bảo đảm không thông báo nào đè lên cái khác. */
type B = { ic: string; name: string; d: string };
const queue: B[] = [];
let draining = false;
const deciding = () => !!document.querySelector('#layer #go, #layer #cgo, #layer #xgo');
function drain(): void {
  whenClear(() => {
    if (deciding()) { setTimeout(drain, 600); return; }
    const bs = queue.splice(0);
    draining = false;
    if (!bs.length) return;
    const [b] = bs, more = bs.length > 1;
    toast(`<span class="bi">${more ? bs.length : b.ic}</span><span><span class="mono">${more ? `${bs.length} huy hiệu mới` : 'Huy hiệu mới'}</span><b>${more ? bs.map(x => x.name).join(', ') : b.name}</b>${more ? '' : `<small>${b.d}</small>`}</span>`,
      () => { SND.fanfare(); buzz(20); }, true);
  });
}

/** Award newly earned badges, announcing them with a toast + chime once nothing is in the way. */
export function checkBadges(): void {
  const st = badgeState();
  BADGES.forEach(([id, ic, name, d]) => {
    if (!st[id] || S.badges.includes(id)) return;
    S.badges.push(id);
    save();
    queue.push({ ic, name, d });
  });
  if (queue.length && !draining) { draining = true; setTimeout(drain, 400); }
}
