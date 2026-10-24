import { ERAS, EV, FIG, FIGERA, type Era, type HistEvent, type Option, type ValueKey } from './data';

export const Y0 = 1858;
export const Y1 = 2026;
const KEY = 'dudo-v2';

export interface State {
  step: 'splash' | 'intro' | 'play';
  name: string;
  year: number;
  picks: Record<string, string>;
  seen: string[];
  srcSeen: string[];
  pvSeen: string[];
  figSeen: string[];
  quiz: Record<string, boolean[]>;
  badges: string[];
  filt: string;
  sound: boolean;
  music: boolean;
  haptic: boolean;
  narr: boolean;
  rate: number;
  zoomed: boolean;
  mapTapped: boolean;
  shared: boolean;
  ended: boolean;
}

const def: State = {
  step: 'splash', name: '', year: Y0, picks: {}, seen: [], srcSeen: [], pvSeen: [], figSeen: [], quiz: {}, badges: [],
  filt: 'Tất cả', sound: true, music: true, haptic: true, narr: true, rate: 0.95, zoomed: false, mapTapped: false, shared: false, ended: false,
};

function load(): State {
  try {
    return Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    return { ...def };
  }
}

export let S: State = load();

export function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: progress lives for this session only */ }
}

/** Start over, keeping device preferences. */
export function resetState(): void {
  S = Object.assign({}, def, { picks: {}, quiz: {}, seen: [], srcSeen: [], pvSeen: [], figSeen: [], badges: [], sound: S.sound, music: S.music, haptic: S.haptic, narr: S.narr, rate: S.rate });
  rt.focusEv = null;
  rt.gate = null;
  save();
}

/** Transient (non-persisted) UI state shared across modules. */
export const rt = {
  focusEv: null as HistEvent | null,
  gate: null as Era | null,
};

export const eraOf = (y: number): Era => [...ERAS].reverse().find(e => y >= e.from) || ERAS[0];
export const optOf = (e: Era): Option | undefined => e.opts.find(o => o.id === S.picks[e.id]);
export const curPick = (y: number) => optOf(eraOf(y));
export const picked = (): Option[] => ERAS.map(optOf).filter((o): o is Option => !!o);

export function values(): Record<ValueKey, number> {
  const v: Record<ValueKey, number> = { doc: 0, song: 0, tudo: 0, dk: 0 };
  picked().forEach(o => Object.entries(o.fx || {}).forEach(([k, n]) => (v[k as ValueKey] += n as number)));
  return v;
}

export function allEv(): HistEvent[] {
  const d: HistEvent[] = [];
  picked().forEach(o => d.push(...o.diary));
  return EV.concat(d).sort((a, b) => a.y - b.y || (a.diary ? 1 : 0) - (b.diary ? 1 : 0));
}

export const visEv = (): HistEvent[] => allEv().filter(v => S.filt === 'Tất cả' || v.k === S.filt);
export const figOpen = (id: string) => !!S.picks[FIGERA[id]];
export const figsMet = () => new Set(Object.keys(FIG).filter(figOpen));
export const pct = (y: number) => ((y - Y0) / (Y1 - Y0)) * 100;

export function setFocus(): void {
  const list = visEv().filter(v => v.y <= S.year);
  rt.focusEv = list.length ? list[list.length - 1] : null;
}

export function archetype(): [string, string] | null {
  const c: Record<string, number> = { vutrang: 0, caicach: 0, thuongthuyet: 0 };
  picked().forEach(o => c[o.tag]++);
  const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  if (!top[1]) return null;
  return ({
    vutrang: ['Người cầm súng', 'Bạn tin rằng độc lập phải giành bằng đấu tranh trực diện.'],
    caicach: ['Nhà canh tân', 'Bạn tin vào giáo dục, cải cách và thay đổi từ bên trong.'],
    thuongthuyet: ['Người hoà giải', 'Bạn chọn thương thuyết, nhượng bộ và giữ gìn sinh mạng.'],
  } as Record<string, [string, string]>)[top[0]];
}

export function matchStats() {
  let m = 0, t = 0, ag = 0;
  ERAS.forEach(e => {
    if (!e.prev) return;
    t++;
    const o = S.picks[e.id];
    if (!o) return;
    if (o === e.prev) m++; else ag++;
  });
  return { m, t, ag };
}

export const quizCorrect = () => Object.values(S.quiz).flat().filter(Boolean).length;
export const familyName = () => S.name || 'Họ Lê';
