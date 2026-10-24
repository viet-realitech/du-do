import { BADGES } from './data';
import { S, save, picked, matchStats, quizCorrect, figsMet } from './state';
import { toast } from './ui/dom';
import { SND, buzz } from './audio';

function badgeState(): Record<string, boolean> {
  const ms = matchStats(), tags = new Set(picked().map(o => o.tag));
  const real = S.seen.filter(i => !i.startsWith('d-')).length;
  return {
    start: S.step === 'play', r10: real >= 10, r40: real >= 40, s5: S.srcSeen.length >= 5, pv10: S.pvSeen.length >= 10,
    q6: quizCorrect() >= 6, q12: quizCorrect() >= 12, tags: tags.size === 3, against: ms.ag >= 3, match: ms.m === 5,
    map: S.zoomed && S.mapTapped, fig8: figsMet().size >= 8, diary: S.seen.filter(i => i.startsWith('d-')).length >= 6,
    done: S.ended, share: S.shared,
  };
}

/** Award newly earned badges, announcing each with a staggered toast + chime. */
export function checkBadges(): void {
  const st = badgeState();
  let n = 0;
  BADGES.forEach(([id, ic, name, d]) => {
    if (!st[id] || S.badges.includes(id)) return;
    S.badges.push(id);
    save();
    setTimeout(() => {
      toast(`<span class="bi">${ic}</span><span><span class="mono" style="opacity:.7">Huy hiệu mới</span><br><b>${name}</b> · ${d}</span>`);
      SND.fanfare();
      buzz(20);
    }, 400 + n++ * 1400);
  });
}
