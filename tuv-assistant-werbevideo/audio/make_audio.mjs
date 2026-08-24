#!/usr/bin/env node
/**
 * Synthesizes the complete soundtrack — an original 80s-soul/funk groove
 * (swung drums, fingered bass riff, Rhodes stabs, snaps — cool & laid-back),
 * scene-accurate sound effects, and the German voiceover (audio/vo/vo1..7.wav).
 * Music ducks automatically under the voice.
 * Output: audio/soundtrack.wav  (44.1 kHz, 16-bit stereo)
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const DUR = 58;
const N = SR * DUR;
const dir = path.dirname(fileURLToPath(import.meta.url));

const ML = new Float64Array(N), MR = new Float64Array(N);   // music (ducked)
const FL = new Float64Array(N), FR = new Float64Array(N);   // sfx
const VL = new Float64Array(N), VR = new Float64Array(N);   // voice

let seed = 0x5eed;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const TAU = Math.PI * 2;

function addTo(L, R, t0, dur, gain, pan, fn) {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  const gl = gain * (pan <= 0 ? 1 : 1 - pan);
  const gr = gain * (pan >= 0 ? 1 : 1 + pan);
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= N) continue;
    const v = fn(i / SR);
    L[idx] += v * gl;
    R[idx] += v * gr;
  }
}
const addM = (...a) => addTo(ML, MR, ...a);
const addF = (...a) => addTo(FL, FR, ...a);
const env = (t, a, hold, rel) => t < a ? t / a : t < a + hold ? 1 : Math.max(0, 1 - (t - a - hold) / rel);
const exp = (t, tau) => Math.exp(-t / tau);

/* ------------------------------------------------ groove instruments */
function kick(t0, g = 0.3) {
  addM(t0, 0.3, g, 0, (t) => {
    const f = 44 + 70 * Math.exp(-t / 0.05);
    return Math.sin(TAU * (f * t + 0.5 * 0.05 * 70 * (1 - Math.exp(-t / 0.05)))) * exp(t, 0.11)
      + (t < 0.003 ? (rnd() * 2 - 1) * 0.3 * (1 - t / 0.003) : 0);
  });
}
function backbeat(t0, g = 0.1) {   // warm 80s rim + snap layer on 2 & 4
  let lp = 0;
  addM(t0, 0.22, g, -0.06, (t) => {
    const n = rnd() * 2 - 1;
    lp += 0.3 * (n - lp);
    const body = Math.sin(TAU * 195 * t) * exp(t, 0.045) * 0.8;
    const crack = lp * 2.4 * exp(t, 0.055);
    return body + crack;
  });
  addM(t0 + 0.004, 0.09, g * 0.55, 0.1, (t) => {   // finger snap
    const n = rnd() * 2 - 1;
    return n * Math.sin(TAU * 2100 * t) * exp(t, 0.018);
  });
}
function hat(t0, g = 0.03, open = false, pan = 0.18) {
  let p = 0;
  addM(t0, open ? 0.2 : 0.06, g, pan, (t) => {
    const n = rnd() * 2 - 1;
    const hp = n - p; p = n;
    return hp * exp(t, open ? 0.06 : 0.017);
  });
}
function shaker(t0, g = 0.022) {
  let lp = 0, p = 0;
  addM(t0, 0.1, g, -0.22, (t) => {
    const n = rnd() * 2 - 1;
    lp += 0.55 * (n - lp); const hp = lp - p; p = lp;
    return hp * 6 * Math.sin(Math.PI * Math.min(1, t / 0.1)) ** 2;
  });
}
function bassNote(t0, f, dur, g = 0.15, ghost = false) {   // fingered funk bass
  let lp = 0;
  addM(t0, dur + 0.09, g * (ghost ? 0.5 : 1), 0, (t) => {
    let s = Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2 * t) + 0.18 * Math.sin(TAU * f * 3 * t)
      + 0.5 * Math.sin(TAU * f * 0.5 * t);
    lp += 0.14 * (s - lp);
    const pluckNoise = t < 0.006 ? (rnd() * 2 - 1) * 0.35 * (1 - t / 0.006) : 0;
    return (lp + pluckNoise) * env(t, 0.006, Math.max(0, dur - 0.06), 0.07) * exp(t, dur + 0.3);
  });
}
function rhodes(t0, freqs, dur, g = 0.05, stab = true) {
  for (const f of freqs) {
    const ph = rnd() * TAU;
    addM(t0, dur + 0.5, g, (rnd() - 0.5) * 0.5, (t) => {
      const trem = 1 + 0.13 * Math.sin(TAU * 4.6 * t + ph);
      const s = Math.sin(TAU * f * t + ph) + 0.42 * Math.sin(TAU * f * 2 * t) * exp(t, 0.25)
        + 0.1 * Math.sin(TAU * f * 4 * t) * exp(t, 0.08);
      return s * trem * env(t, 0.006, stab ? 0.02 : Math.max(0, dur - 0.5), stab ? dur : 0.9);
    });
  }
}
function padChord(t0, freqs, dur, g = 0.03) {   // low glue pad
  for (const f of freqs) {
    for (const det of [-0.3, 0.3]) {
      const ff = f * (1 + det / 100);
      const ph = rnd() * TAU;
      let lp = 0;
      addM(t0, dur + 1.4, g, det > 0 ? 0.3 : -0.3, (t) => {
        let s = Math.sin(TAU * ff * t + ph) + 0.3 * Math.sin(TAU * ff * 2 * t + ph * 1.7);
        lp += 0.05 * (s - lp);
        return lp * env(t, 0.9, Math.max(0, dur - 0.9), 1.4);
      });
    }
  }
}

/* ------------------------------------------------ sfx */
function ringTone(t0, g = 0.1) {
  for (const off of [0, 0.42]) {
    let lp = 0;
    addF(t0 + off, 0.34, g, -0.35, (t) => {
      const s = (Math.sin(TAU * 425 * t) + Math.sin(TAU * 450 * t)) * 0.5 * (0.6 + 0.4 * Math.sin(TAU * 22 * t));
      lp += 0.25 * (s - lp);
      return lp * env(t, 0.01, 0.28, 0.05);
    });
  }
}
function msgIn(t0, pitch = 1, g = 0.14) {
  const tone = (tt0, f, d) => addF(tt0, d + 0.2, g, 0.2, (t) =>
    (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.01 * t) + 0.12 * Math.sin(TAU * f * 3.99 * t)) * exp(t, 0.09) * env(t, 0.002, 0, d + 0.19));
  tone(t0, 784 * pitch, 0.07);
  tone(t0 + 0.09, 1046.5 * pitch, 0.12);
}
function msgOut(t0, g = 0.13) {
  addF(t0, 0.14, g, 0.25, (t) => {
    const f = 620 - 260 * (t / 0.14);
    return Math.sin(TAU * f * t) * exp(t, 0.05) * env(t, 0.002, 0, 0.13);
  });
}
function tick(t0, pitch = 1, g = 0.06) {
  addF(t0, 0.05, g, 0.1, (t) => (Math.sin(TAU * 900 * pitch * t) + 0.3 * (rnd() * 2 - 1)) * exp(t, 0.012));
}
function whoosh(t0, dur = 0.55, g = 0.07, dirn = 1) {
  let lp = 0, p = 0;
  addF(t0, dur, g, 0.2 * dirn, (t) => {
    const x = t / dur;
    const n = rnd() * 2 - 1;
    lp += (0.02 + 0.3 * x) * (n - lp);
    const hp = lp - p; p = lp;
    return (dirn > 0 ? hp * 8 : lp * 2.5) * Math.sin(Math.PI * x) ** 1.5;
  });
}
function riser(t0, dur, g = 0.07) {
  let lp = 0;
  addF(t0, dur, g, 0, (t) => {
    const x = t / dur;
    const n = rnd() * 2 - 1;
    lp += (0.01 + 0.4 * x * x) * (n - lp);
    const tone = Math.sin(TAU * (180 + 520 * x * x) * t) * 0.25;
    return (lp * 3 + tone) * (x * x);
  });
}
function impact(t0, g = 0.34, big = true) {
  addF(t0, big ? 1.6 : 0.7, g, 0, (t) => {
    const f = (big ? 34 : 48) + (big ? 62 : 70) * Math.exp(-t / 0.09);
    const body = Math.sin(TAU * (f * t)) * exp(t, big ? 0.45 : 0.18);
    const n = (rnd() * 2 - 1) * exp(t, 0.05) * 0.4;
    return body + n;
  });
}
function shimmer(t0, g = 0.03) {
  for (const f of [1244, 1567, 1864, 2489, 3135]) {
    const ph = rnd() * TAU, det = 1 + (rnd() - 0.5) * 0.004;
    addF(t0, 3.2, g, (rnd() - 0.5) * 0.9, (t) => Math.sin(TAU * f * det * t + ph) * exp(t, 0.9) * env(t, 0.05, 0, 3.1));
  }
}
function chime(t0, g = 0.13) {
  [523.25, 659.25, 783.99].forEach((f, i) => {
    addF(t0 + i * 0.085, 0.9, g * (1 - i * 0.15), 0.25, (t) =>
      (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2 * t)) * exp(t, 0.28) * env(t, 0.003, 0, 0.85));
  });
}
function switchClick(t0, g = 0.13) {
  tick(t0, 0.7, g); tick(t0 + 0.07, 1.15, g);
  addF(t0 + 0.1, 0.16, g * 0.9, 0, (t) => Math.sin(TAU * (300 + 340 * (t / 0.16)) * t) * exp(t, 0.06));
}
function checkPop(t0, i, g = 0.14) {
  const f = [587.3, 698.5, 880, 1046.5][i];
  addF(t0, 0.4, g, 0.1, (t) => (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)) * exp(t, 0.11) * env(t, 0.002, 0, 0.39));
  tick(t0, 1.3, 0.045);
}

/* ------------------------------------------------ the groove */
const BPM = 106, BEAT = 60 / BPM, BAR = 4 * BEAT, SIX = BEAT / 4;
const SWING = 0.30;                       // odd 16ths land late — laid-back
const M0 = 7.0;
const MUSIC_END = 50.05;
const stepT = (barT, step) => barT + step * SIX + (step % 2 === 1 ? SWING * SIX : 0);

/* two-chord soul vamp Am9 ↔ D9; warm Fmaj7/G6 bridge; Am9 outro */
const CH = {
  Am9: { rho: [261.63, 329.63, 392, 493.88], root: 110, pad: [110, 164.81], spark: 659.25 },
  D9:  { rho: [185, 220, 261.63, 329.63], root: 146.83, pad: [73.42, 110], spark: 587.33 },
  F7:  { rho: [220, 261.63, 329.63, 174.61], root: 87.31, pad: [87.31, 130.81], spark: 523.25 },
  G6:  { rho: [246.94, 293.66, 329.63, 392], root: 98, pad: [98, 146.83], spark: 587.33 },
};
function chordAt(t) {
  if (t >= 50) return CH.Am9;
  const bar2 = Math.floor((t - M0) / (2 * BAR));
  if (t >= 34 && t < 41) return bar2 % 2 === 0 ? CH.F7 : CH.G6;
  return bar2 % 2 === 0 ? CH.Am9 : CH.D9;
}

/* intro 0–7: warm, slightly tense, sparse snaps */
padChord(0.2, [110, 164.81, 220], 6.4, 0.038);
addM(0.2, 6.8, 0.045, 0, (t) => Math.sin(TAU * 55 * t) * env(t, 1.4, 4.2, 1.2));
for (const t of [2.26, 3.4, 4.53, 5.66]) backbeat(t, 0.05);

/* glue pads on the 2-bar grid */
for (let t = M0; t < 55.0; t += 2 * BAR) {
  const c = chordAt(t + 0.01);
  padChord(t, c.pad, 2 * BAR, t >= 34 && t < 41 ? 0.038 : 0.03);
}

/* bar loop */
for (let b = M0; b < MUSIC_END - 0.01; b += BAR) {
  const c = chordAt(b + 0.01);
  const bar = Math.round((b - M0) / BAR);
  const lite = b < 14, bridge = b >= 34 && b < 41, peak = b >= 41;

  /* drums */
  kick(stepT(b, 0), lite ? 0.26 : 0.3);
  if (!bridge) kick(stepT(b, 8), lite ? 0.22 : 0.27);
  if (!lite && !bridge && bar % 2 === 1) kick(stepT(b, 14), 0.16);
  if (!lite) { backbeat(stepT(b, 4), bridge ? 0.07 : 0.1); backbeat(stepT(b, 12), bridge ? 0.07 : 0.1); }
  for (let s = 0; s < 16; s += 2) {                       // swung 8th hats
    if (lite && s % 4 !== 2) continue;
    const accent = s % 4 === 2;
    hat(stepT(b, s), (accent ? 0.032 : 0.02) * (bridge ? 0.7 : 1));
  }
  if (peak && bar % 2 === 1) hat(stepT(b, 14), 0.034, true);
  if ((b >= 25 && !bridge) || peak) for (let s = 1; s < 16; s += 2) shaker(stepT(b, s), peak ? 0.02 : 0.015);

  /* original fingered-bass riff (alternating 2-bar pattern) */
  const R = c.root, O = R * 2, F5 = R * 1.5, S7 = R * 16 / 18;
  if (lite) {
    bassNote(stepT(b, 0), R, SIX * 3.2, 0.13);
    bassNote(stepT(b, 8), R, SIX * 2.6, 0.11);
  } else if (bridge) {
    bassNote(stepT(b, 0), R, SIX * 6.4, 0.125);
    bassNote(stepT(b, 8), F5, SIX * 4.2, 0.1);
  } else if (bar % 2 === 0) {
    bassNote(stepT(b, 0), R, SIX * 2.6, 0.155);
    bassNote(stepT(b, 3), O, SIX * 0.9, 0.115);
    bassNote(stepT(b, 6), F5, SIX * 1.2, 0.12);
    bassNote(stepT(b, 8), R, SIX * 1.8, 0.14);
    bassNote(stepT(b, 11), S7, SIX * 1.0, 0.11);
    bassNote(stepT(b, 14), O, SIX * 0.9, 0.12);
  } else {
    bassNote(stepT(b, 0), R, SIX * 1.8, 0.155);
    bassNote(stepT(b, 2), R, SIX * 0.8, 0.1, true);
    bassNote(stepT(b, 6), O, SIX * 1.0, 0.12);
    bassNote(stepT(b, 8), F5, SIX * 1.8, 0.125);
    bassNote(stepT(b, 12), S7, SIX * 1.0, 0.11);
    bassNote(stepT(b, 14), R, SIX * 1.4, 0.13);
  }

  /* Rhodes: stabs on the "&" of 2 and on 4, long chords to open phrases */
  if (lite || bridge) {
    if (bar % 2 === 0) rhodes(stepT(b, 0), c.rho, BAR * 1.8, bridge ? 0.05 : 0.04, false);
  } else {
    if (bar % 4 === 0) rhodes(stepT(b, 0), c.rho, BAR * 1.1, 0.035, false);
    rhodes(stepT(b, 6), c.rho, 0.42, 0.042);
    rhodes(stepT(b, 12), c.rho, 0.36, 0.036);
    if (peak && bar % 2 === 1) rhodes(stepT(b, 15), [c.spark], 0.5, 0.032);
  }
}

/* outro 50–58: big warm Am9 */
rhodes(50.4, [220, 261.63, 329.63, 392, 493.88], 5.2, 0.05, false);
padChord(50.35, [110, 164.81, 220], 5.2, 0.045);
bassNote(50.4, 55, 3.6, 0.11);

/* ------------------------------------------------ sfx on the film timeline */
ringTone(0.6); ringTone(3.0);
msgIn(1.15, 1); msgIn(1.95, 0.94); msgIn(2.75, 1.06);
tick(2.45, 1); tick(3.15, 0.9);
whoosh(3.85, 0.5, 0.06);
impact(4.85, 0.16, false); shimmer(4.9, 0.012);
riser(5.6, 1.4, 0.08);
impact(7.0, 0.24, false); whoosh(7.05, 0.7, 0.065);
msgOut(9.05);
msgIn(14.15);
tick(14.9, 1.2, 0.05); tick(17.7, 1.3, 0.05); tick(21.0, 1.4, 0.05);
msgOut(16.85);
msgIn(20.15);
tick(20.55, 1.5, 0.045); tick(20.8, 1.7, 0.045); tick(21.05, 1.9, 0.045);
tick(25.25, 2.1, 0.08);
msgOut(25.7);
whoosh(27.3, 0.6, 0.065);
riser(28.0, 0.85, 0.045);
impact(28.9, 0.14, false); chime(28.98);
msgIn(30.3, 1.06);
whoosh(33.9, 0.55, 0.05, -1);
msgOut(35.5);
msgIn(37.5);
switchClick(38.8);
msgIn(39.8, 0.9);
whoosh(41.0, 0.6, 0.06);
[42.2, 43.6, 45.0, 46.4].forEach((t, i) => checkPop(t, i));
[42.4, 43.15, 43.9, 44.65, 45.4, 46.15, 46.9, 47.65].forEach((t, i) => tick(t, 1 + i * 0.06, 0.03));
riser(48.6, 1.7, 0.1);
impact(50.35, 0.4, true); shimmer(50.4, 0.038);
tick(52.4, 0.6, 0.045); tick(53.6, 0.8, 0.045);

/* ------------------------------------------------ voiceover */
function readWavMono(file) {
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF') throw new Error('not a wav: ' + file);
  let off = 12, fmt = null, data = null;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4);
    const sz = b.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(off + 10), sr: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    if (id === 'data') { data = b.subarray(off + 8, off + 8 + sz); break; }
    off += 8 + sz + (sz % 2);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error('unsupported wav: ' + file);
  const frames = Math.floor(data.length / 2 / fmt.ch);
  const mono = new Float64Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    for (let c = 0; c < fmt.ch; c++) s += data.readInt16LE((i * fmt.ch + c) * 2);
    mono[i] = s / fmt.ch / 32768;
  }
  return { sr: fmt.sr, mono };
}

const VO = [
  ['vo1.wav', 1.0], ['vo2.wav', 10.2], ['vo3.wav', 15.6], ['vo4.wav', 28.4],
  ['vo5.wav', 36.8], ['vo6.wav', 43.4], ['vo7.wav', 52.5],
];
const duckWins = [];
for (const [file, t0] of VO) {
  const fp = path.join(dir, 'vo', file);
  if (!existsSync(fp)) { console.warn('missing VO file, skipping:', fp); continue; }
  const { sr, mono } = readWavMono(fp);
  let end = mono.length - 1;
  while (end > 0 && Math.abs(mono[end]) < 0.004) end--;
  let peak = 0;
  for (let i = 0; i <= end; i++) peak = Math.max(peak, Math.abs(mono[i]));
  const g = 0.74 / (peak || 1);
  const ratio = sr / SR;
  const outN = Math.floor((end + 1) / ratio);
  const s0 = Math.round(t0 * SR);
  for (let i = 0; i < outN; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src), fr = src - i0;
    const v = (mono[i0] * (1 - fr) + (mono[i0 + 1] ?? 0) * fr) * g;
    const idx = s0 + i;
    if (idx >= 0 && idx < N) { VL[idx] += v; VR[idx] += v; }
  }
  const durS = outN / SR;
  duckWins.push([t0 - 0.18, t0 + durS + 0.22]);
  console.log(`VO ${file}  ${t0.toFixed(2)}s → ${(t0 + durS).toFixed(2)}s`);
}

function duckGain(t) {
  let g = 1;
  for (const [a, b] of duckWins) {
    if (t < a || t > b + 0.35) continue;
    const fadeIn = Math.min(1, (t - a) / 0.22);
    const fadeOut = t <= b ? 1 : Math.max(0, 1 - (t - b) / 0.35);
    g = Math.min(g, 1 - 0.52 * Math.min(fadeIn, fadeOut));
  }
  return g;
}

/* ------------------------------------------------ master */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const dg = duckGain(t);
  const sl = ML[i] * 0.85 * dg + FL[i] * 0.9 + VL[i];
  const sr2 = MR[i] * 0.85 * dg + FR[i] * 0.9 + VR[i];
  let fade = 1;
  if (t > 56.9) fade = Math.max(0, 1 - (t - 56.9) / 1.0);
  if (t < 0.05) fade *= t / 0.05;
  ML[i] = Math.tanh(sl * 1.1) * fade;
  MR[i] = Math.tanh(sr2 * 1.1) * fade;
}
let peak = 0, rms = 0;
for (let i = 0; i < N; i++) { peak = Math.max(peak, Math.abs(ML[i]), Math.abs(MR[i])); rms += ML[i] * ML[i] + MR[i] * MR[i]; }
rms = Math.sqrt(rms / (2 * N));
const norm = 0.89 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ML[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, MR[i] * norm)) * 32767), 46 + i * 4);
}
const out = path.join(dir, 'soundtrack.wav');
writeFileSync(out, buf);
console.log(`wrote ${out}  peak=${peak.toFixed(3)} rms=${(20 * Math.log10(rms)).toFixed(1)} dBFS  norm=${norm.toFixed(3)}`);
