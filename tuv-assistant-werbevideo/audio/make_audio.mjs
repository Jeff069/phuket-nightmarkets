#!/usr/bin/env node
/**
 * Synthesizes the complete soundtrack (music bed + sound effects),
 * sample-accurate to the film timeline in film/index.html.
 * Output: audio/soundtrack.wav  (44.1 kHz, 16-bit stereo)
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const DUR = 58;
const N = SR * DUR;
const L = new Float64Array(N);
const R = new Float64Array(N);

/* seeded RNG so renders are reproducible */
let seed = 0x5eed;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const TAU = Math.PI * 2;

/** add(t0, dur, gain, pan, fn(tLocal) -> sample) */
function add(t0, dur, gain, pan, fn) {
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
const env = (t, a, hold, rel) => t < a ? t / a : t < a + hold ? 1 : Math.max(0, 1 - (t - a - hold) / rel);
const exp = (t, tau) => Math.exp(-t / tau);

/* ------------------------------------------------ instruments */
function kick(t0, g = 0.4) {
  add(t0, 0.34, g, 0, (t) => {
    const f = 42 + 85 * Math.exp(-t / 0.055);
    return Math.sin(TAU * (f * t + 0.5 * 0.055 * 85 * (1 - Math.exp(-t / 0.055)))) * exp(t, 0.12)
      + (t < 0.004 ? (rnd() * 2 - 1) * 0.5 * (1 - t / 0.004) : 0);
  });
}
function hat(t0, open = false, g = 0.055, pan = 0.15) {
  let p = 0;
  add(t0, open ? 0.24 : 0.06, g, pan, (t) => {
    const n = rnd() * 2 - 1;
    const hp = n - p; p = n;                       // crude highpass
    return hp * exp(t, open ? 0.07 : 0.016);
  });
}
function clap(t0, g = 0.13) {
  let p = 0;
  add(t0, 0.28, g, -0.1, (t) => {
    const n = rnd() * 2 - 1;
    const hp = n - p * 0.7; p = n;
    const bursts = (t < 0.012 ? 1 : t < 0.024 ? 0.8 : t < 0.036 ? 0.65 : 0) * 0.7;
    return hp * (bursts + exp(Math.max(0, t - 0.03), 0.055));
  });
}
function bassNote(t0, f, dur, g = 0.17) {
  let lp = 0;
  add(t0, dur + 0.08, g, 0, (t) => {
    let s = 0;
    for (let h = 1; h <= 5; h++) s += Math.sin(TAU * f * h * t) / h;   // saw-ish
    s += Math.sin(TAU * f * 0.5 * t) * 0.6;                            // sub octave
    lp += 0.16 * (s - lp);                                             // one-pole LP
    return lp * env(t, 0.008, Math.max(0, dur - 0.07), 0.07);
  });
}
function padChord(t0, freqs, dur, g = 0.045) {
  for (const f of freqs) {
    for (const det of [-0.35, 0.35]) {
      const ff = f * (1 + det / 100);
      const ph = rnd() * TAU;
      let lp = 0;
      add(t0, dur + 1.2, g, det > 0 ? 0.3 : -0.3, (t) => {
        let s = Math.sin(TAU * ff * t + ph) + 0.4 * Math.sin(TAU * ff * 2 * t + ph * 1.7) + 0.15 * Math.sin(TAU * ff * 3 * t);
        lp += 0.06 * (s - lp);
        return lp * env(t, 0.7, Math.max(0, dur - 0.7), 1.2);
      });
    }
  }
}
function pluck(t0, f, g = 0.1, echo = true) {
  const voice = (tt0, gg) => add(tt0, 0.5, gg, (rnd() - 0.5) * 0.5, (t) =>
    (Math.sin(TAU * f * t) + 0.45 * Math.sin(TAU * f * 2 * t) + 0.12 * Math.sin(TAU * f * 3 * t)) * exp(t, 0.14) * env(t, 0.003, 0, 0.5));
  voice(t0, g);
  if (echo) { voice(t0 + 0.288, g * 0.4); voice(t0 + 0.577, g * 0.16); }
}

/* ------------------------------------------------ sfx */
function ringTone(t0, g = 0.11) {   // muffled workshop phone: double burst
  for (const off of [0, 0.42]) {
    let lp = 0;
    add(t0 + off, 0.34, g, -0.35, (t) => {
      const s = (Math.sin(TAU * 425 * t) + Math.sin(TAU * 450 * t)) * 0.5 * (0.6 + 0.4 * Math.sin(TAU * 22 * t));
      lp += 0.25 * (s - lp);
      return lp * env(t, 0.01, 0.28, 0.05);
    });
  }
}
function msgIn(t0, pitch = 1, g = 0.16) {   // two-tone marimba blip
  const tone = (tt0, f, d) => add(tt0, d + 0.2, g, 0.2, (t) =>
    (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.01 * t) + 0.12 * Math.sin(TAU * f * 3.99 * t)) * exp(t, 0.09) * env(t, 0.002, 0, d + 0.19));
  tone(t0, 784 * pitch, 0.07);
  tone(t0 + 0.09, 1046.5 * pitch, 0.12);
}
function msgOut(t0, g = 0.15) {   // short descending pop
  add(t0, 0.14, g, 0.25, (t) => {
    const f = 620 - 260 * (t / 0.14);
    return Math.sin(TAU * f * t) * exp(t, 0.05) * env(t, 0.002, 0, 0.13);
  });
}
function tick(t0, pitch = 1, g = 0.07) {
  add(t0, 0.05, g, 0.1, (t) => (Math.sin(TAU * 900 * pitch * t) + 0.3 * (rnd() * 2 - 1)) * exp(t, 0.012));
}
function whoosh(t0, dur = 0.55, g = 0.09, dir = 1) {
  let lp = 0, p = 0;
  add(t0, dur, g, 0.2 * dir, (t) => {
    const x = t / dur;
    const n = rnd() * 2 - 1;
    lp += (0.02 + 0.3 * x) * (n - lp);      // opening filter
    const hp = lp - p; p = lp;
    return (dir > 0 ? hp * 8 : lp * 2.5) * Math.sin(Math.PI * x) ** 1.5;
  });
}
function riser(t0, dur, g = 0.1) {
  let lp = 0;
  add(t0, dur, g, 0, (t) => {
    const x = t / dur;
    const n = rnd() * 2 - 1;
    lp += (0.01 + 0.4 * x * x) * (n - lp);
    const tone = Math.sin(TAU * (180 + 520 * x * x) * t) * 0.25;
    return (lp * 3 + tone) * (x * x);
  });
}
function impact(t0, g = 0.42, big = true) {
  add(t0, big ? 1.6 : 0.7, g, 0, (t) => {
    const f = (big ? 34 : 48) + (big ? 62 : 70) * Math.exp(-t / 0.09);
    const body = Math.sin(TAU * (f * t)) * exp(t, big ? 0.45 : 0.18);
    const n = (rnd() * 2 - 1) * exp(t, 0.05) * 0.5;
    return body + n;
  });
}
function shimmer(t0, g = 0.032) {
  for (const f of [1244, 1567, 1864, 2489, 3135]) {
    const ph = rnd() * TAU, det = 1 + (rnd() - 0.5) * 0.004;
    add(t0, 3.2, g, (rnd() - 0.5) * 0.9, (t) => Math.sin(TAU * f * det * t + ph) * exp(t, 0.9) * env(t, 0.05, 0, 3.1));
  }
}
function chime(t0, g = 0.14) {   // booking confirmed: quick major arpeggio
  [523.25, 659.25, 783.99].forEach((f, i) => {
    add(t0 + i * 0.085, 0.9, g * (1 - i * 0.15), 0.25, (t) =>
      (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2 * t)) * exp(t, 0.28) * env(t, 0.003, 0, 0.85));
  });
}
function switchClick(t0, g = 0.14) {
  tick(t0, 0.7, g); tick(t0 + 0.07, 1.15, g);
  add(t0 + 0.1, 0.16, g * 0.9, 0, (t) => Math.sin(TAU * (300 + 340 * (t / 0.16)) * t) * exp(t, 0.06));
}
function checkPop(t0, i, g = 0.16) {
  const f = [587.3, 698.5, 880, 1046.5][i];
  add(t0, 0.4, g, 0.1, (t) => (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)) * exp(t, 0.11) * env(t, 0.002, 0, 0.39));
  tick(t0, 1.3, 0.05);
}

/* ------------------------------------------------ music bed */
const BPM = 104, BEAT = 60 / BPM, BAR = BEAT * 4;
const M0 = 7.0;                       // music grid start
const MUSIC_END = 50.05;              // drums stop for the finale

/* chord progression: Am F C G, 2 bars each, from grid start */
const CH = {
  Am: { pad: [220, 261.63, 329.63], root: 110, arp: [440, 523.25, 659.25, 523.25] },
  F:  { pad: [174.61, 220, 261.63], root: 87.31, arp: [349.23, 440, 523.25, 440] },
  C:  { pad: [196, 261.63, 329.63], root: 130.81, arp: [392, 523.25, 659.25, 523.25] },
  G:  { pad: [196, 246.94, 293.66], root: 98, arp: [392, 493.88, 587.33, 493.88] },
};
const PROG = ['Am', 'F', 'C', 'G'];
function chordAt(t) {
  const idx = Math.floor((t - M0) / (2 * BAR));
  return CH[PROG[((idx % 4) + 4) % 4]];
}

/* intro drone 0–7: tension */
padChord(0.15, [110, 164.81], 6.6, 0.035);
add(0.15, 6.9, 0.05, 0, (t) => Math.sin(TAU * 55 * t) * env(t, 1.2, 4.6, 1.1));
for (let b = 0; b < 12; b++) tick(0.4 + b * BEAT, 0.5, 0.018);   // faint pulse

/* pads from 7 on the 2-bar grid */
for (let t = M0; t < 55.5; t += 2 * BAR) {
  const c = chordAt(t + 0.01);
  const isOutro = t >= MUSIC_END - 2 * BAR && t + 2 * BAR >= MUSIC_END;
  padChord(t, c.pad, isOutro ? 5.5 : 2 * BAR, t >= 34 && t < 41 ? 0.058 : 0.045);
  if (t < MUSIC_END - 1) bassNote(t + 0.5 * BEAT, c.root, 0.3 * BEAT);
}

/* drums + bass pattern */
for (let t = M0; t < MUSIC_END; t += BEAT) {
  const beatIdx = Math.round((t - M0) / BEAT);
  const bar = Math.floor(beatIdx / 4), pos = beatIdx % 4;
  const section = t < 14 ? 'lite' : t < 25 ? 'full' : t < 34 ? 'var' : t < 41 ? 'warm' : 'peak';

  /* kick */
  if (section === 'lite') { if (pos === 0 || pos === 2) kick(t, 0.34); }
  else kick(t, section === 'warm' ? 0.32 : 0.4);

  /* clap on 2 & 4 */
  if (pos === 1 || pos === 3) {
    if (section === 'full' || section === 'var') clap(t, 0.11);
    if (section === 'peak') clap(t, 0.14);
  }

  /* hats: offbeat 8ths */
  if (section !== 'lite' || pos % 2 === 0) hat(t + BEAT / 2, false, section === 'peak' ? 0.06 : 0.045);
  if (section === 'peak' && pos === 3 && bar % 2 === 1) hat(t + BEAT / 2, true, 0.05);

  /* bass: root on offbeats */
  const c = chordAt(t);
  if (section !== 'lite') {
    bassNote(t + BEAT / 2, c.root, 0.26 * BEAT, section === 'warm' ? 0.13 : 0.17);
    if (pos === 3) bassNote(t + BEAT * 0.75, c.root * 1.5, 0.2 * BEAT, 0.1);
  }
}

/* pluck arps (sparse from 25, denser from 41) */
for (let t = 25.4 - (25.4 - M0) % (BEAT / 2); t < MUSIC_END; t += BEAT / 2) {
  if (t < 25.2) continue;
  const step = Math.round((t - M0) / (BEAT / 2));
  const c = chordAt(t);
  const dense = t >= 41;
  if (t >= 34 && t < 41) { if (step % 4 === 0) pluck(t, c.arp[0] / 2, 0.07); continue; }
  if (step % 2 === 0 || (dense && step % 4 === 1)) pluck(t, c.arp[(step >> 1) % 4], dense ? 0.085 : 0.07);
}

/* ------------------------------------------------ score: sfx on the film timeline */
ringTone(0.6); ringTone(3.0);
msgIn(1.15, 1); msgIn(1.95, 0.94); msgIn(2.75, 1.06);
tick(2.45, 1); tick(3.15, 0.9);
whoosh(3.85, 0.5, 0.07);
impact(4.85, 0.2, false); shimmer(4.9, 0.014);
riser(5.6, 1.4, 0.1);
impact(7.0, 0.3, false); whoosh(7.05, 0.7, 0.08);
msgOut(9.05);
msgIn(14.15);
tick(14.9, 1.2, 0.06); tick(17.7, 1.3, 0.06); tick(21.0, 1.4, 0.06);
msgOut(16.85);
msgIn(20.15);
tick(20.55, 1.5, 0.05); tick(20.8, 1.7, 0.05); tick(21.05, 1.9, 0.05);
tick(25.25, 2.1, 0.09);
msgOut(25.7);
whoosh(27.3, 0.6, 0.08);
riser(28.0, 0.85, 0.055);
impact(28.9, 0.16, false); chime(28.98);
msgIn(30.3, 1.06);
whoosh(33.9, 0.55, 0.06, -1);
msgOut(35.5);
msgIn(37.5);
switchClick(38.8);
msgIn(39.8, 0.9);
whoosh(41.0, 0.6, 0.07);
[42.2, 43.6, 45.0, 46.4].forEach((t, i) => checkPop(t, i));
[42.4, 43.15, 43.9, 44.65, 45.4, 46.15, 46.9, 47.65].forEach((t, i) => tick(t, 1 + i * 0.06, 0.035));
riser(48.6, 1.7, 0.12);
impact(50.35, 0.5, true); shimmer(50.4, 0.04);
padChord(50.35, [220, 261.63, 329.63, 440], 5.6, 0.055);   // final Am hold
bassNote(50.35, 55, 3.4, 0.12);
tick(52.4, 0.6, 0.05); tick(53.6, 0.8, 0.05);
msgIn(53.75, 1.12, 0.1);   // subtle sonic logo on the claim

/* ------------------------------------------------ master */
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let fade = 1;
  if (t > 56.9) fade = Math.max(0, 1 - (t - 56.9) / 1.0);
  if (t < 0.05) fade *= t / 0.05;
  L[i] = Math.tanh(L[i] * 1.15) * fade;
  R[i] = Math.tanh(R[i] * 1.15) * fade;
}
let peak = 0, rms = 0;
for (let i = 0; i < N; i++) { peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); rms += L[i] * L[i] + R[i] * R[i]; }
rms = Math.sqrt(rms / (2 * N));
const norm = 0.88 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'soundtrack.wav');
writeFileSync(out, buf);
console.log(`wrote ${out}  peak=${peak.toFixed(3)} rms=${(20 * Math.log10(rms)).toFixed(1)} dBFS  norm=${norm.toFixed(3)}`);
