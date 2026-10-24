import { S } from './state';
import { ac, bus } from './audio';

/* Soundtrack: one looping track per mood, cross-faded through the effects bus (so narration
   ducks it). Tracks: Kevin MacLeod (incompetech.com), CC BY 4.0, built by `npm run music`. */
export type Mood = 'calm' | 'gate' | 'colony' | 'war' | 'rebuild' | 'finale';

const VOL: Record<Mood, number> = { calm: 0.28, gate: 0.4, colony: 0.45, war: 0.5, rebuild: 0.45, finale: 0.6 };
const FADE = 1.8;

interface Deck { m: Mood; el: HTMLAudioElement; g: GainNode }
let cur: Deck | null = null;
let want: Mood | null = null;
let master: GainNode | null = null;

/** Mood for a chapter tour (era ids e1…e6). */
export const eraMood = (id: string): Mood => (id <= 'e3' ? 'colony' : id <= 'e5' ? 'war' : 'rebuild');

function stopDeck(d: Deck, a: AudioContext): void {
  const t = a.currentTime;
  d.g.gain.cancelScheduledValues(t);
  d.g.gain.setValueAtTime(d.g.gain.value, t);
  d.g.gain.linearRampToValueAtTime(0, t + FADE);
  setTimeout(() => { d.el.pause(); d.el.removeAttribute('src'); d.el.load(); d.g.disconnect(); }, FADE * 1000 + 100);
}

function apply(): void {
  const m = S.sound && S.music ? want : null;
  if (cur && cur.m === m) return;
  const out = bus(), a = ac();
  if (!out || !a) return;
  // Until a user gesture unlocks audio the context stays suspended: wait instead of downloading a track that can't play.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // retried on the first tap
  if (a.state !== 'running') { a.resume().then(() => { if (a.state === 'running') apply(); }, () => {}); return; }
  if (!master) { master = a.createGain(); master.connect(out); }
  if (cur) { stopDeck(cur, a); cur = null; }
  if (!m) return;
  const el = new Audio(`${import.meta.env.BASE_URL}music/${m}.m4a`);
  el.loop = true;
  el.preload = 'auto';
  const g = a.createGain();
  g.gain.value = 0;
  a.createMediaElementSource(el).connect(g).connect(master);
  const d: Deck = { m, el, g };
  cur = d;
  el.play().then(() => {
    if (cur !== d) return;
    const t = a.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(VOL[m], t + FADE);
  }).catch(() => { if (cur === d) cur = null; }); // not allowed yet: retried on the next tap
}

/** Ask for a mood (null = silence). Starts as soon as the browser allows audio. */
export function mood(m: Mood | null): void {
  want = m;
  apply();
}

/** Re-evaluate after the sound / music settings change. */
export const refreshMusic = apply;

export function initMusic(): void {
  // Browsers only start audio from a user gesture: try again on every tap until it plays.
  addEventListener('pointerdown', () => { if (want && !cur) apply(); }, true);
  document.addEventListener('visibilitychange', () => {
    if (!cur) return;
    if (document.hidden) cur.el.pause(); else cur.el.play().catch(() => {});
  });
}
