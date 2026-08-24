#!/usr/bin/env node
/**
 * Renders film/index.html frame by frame with Chromium (Playwright)
 * and pipes the frames into ffmpeg.
 *
 *   node render/render.mjs --snap 3,10.5,21          → QA still frames (PNG)
 *   node render/render.mjs --video [--audio out.wav] → out/tuv-assistant-werbevideo.mp4
 */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const W = 1920, H = 1080;

function findChromium() {
  for (const base of ['/opt/pw-browsers']) {
    const hits = globSync(`${base}/chromium-*/chrome-linux/chrome`);
    if (hits.length) return hits.sort().pop();
  }
  return undefined; // let playwright-core resolve
}

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

async function boot() {
  const browser = await chromium.launch({
    executablePath: findChromium(),
    headless: true,
    args: [
      '--allow-file-access-from-files',
      '--force-color-profile=srgb',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      '--disable-lcd-text',
    ],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });
  page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
  await page.goto('file://' + path.join(root, 'film', 'index.html') + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.FILM && window.FILM.isReady()', null, { timeout: 20000 });
  return { browser, page };
}

async function snap(times) {
  const { browser, page } = await boot();
  const dir = path.join(root, 'out', 'frames-qa');
  mkdirSync(dir, { recursive: true });
  for (const t of times) {
    await page.evaluate((tt) => window.FILM.seekTo(tt), t);
    const file = path.join(dir, `t${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: file });
    console.log('wrote', file);
  }
  await browser.close();
}

async function video() {
  const { browser, page } = await boot();
  const duration = await page.evaluate('window.FILM.DURATION');
  const total = Math.round(duration * FPS);
  const audio = getArg('--audio');
  const outFile = path.join(root, 'out', 'tuv-assistant-werbevideo.mp4');
  mkdirSync(path.join(root, 'out'), { recursive: true });

  const ffmpeg = (await import('ffmpeg-static')).default;
  const ffArgs = [
    '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...(audio && existsSync(audio) ? ['-i', audio] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    ...(audio && existsSync(audio) ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-movflags', '+faststart',
    outFile,
  ];
  const ff = spawn(ffmpeg, ffArgs, { stdio: ['pipe', 'inherit', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });
  const ffDone = new Promise((res, rej) => {
    ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg exit ' + code + '\n' + ffErr.slice(-2000)))));
  });

  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.FILM.seekTo(tt), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 150 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${i}/${total}  (${(i / total * 100).toFixed(0)}%, ${el.toFixed(0)}s elapsed)`);
    }
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
  console.log('done →', outFile);
}

const snapArg = getArg('--snap');
if (snapArg) await snap(snapArg.split(',').map(Number));
else if (args.includes('--video')) await video();
else { console.log('usage: render.mjs --snap 1,2,3 | --video [--audio file.wav]'); process.exit(1); }
