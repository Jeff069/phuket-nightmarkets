# Der digitale TÜV-Assistent — Werbevideo

58-Sekunden-Werbefilm (1920×1080, 30 fps, H.264 + AAC), komplett aus Code gerendert —
keine Stock-Clips, kein Schnittprogramm. Der gesamte Film ist eine deterministische
Timeline-Animation in einer einzigen HTML-Datei, die Frame für Frame mit Chromium
abfotografiert und mit einer programmatisch synthetisierten Tonspur gemischt wird.

**Fertiges Video:** [`out/tuv-assistant-werbevideo.mp4`](out/tuv-assistant-werbevideo.mp4)

## Szenen

| Zeit | Szene |
|---|---|
| 0:00–0:07 | **Das Problem** — Anruf klingelt, WhatsApp-Anfragen stapeln sich: „Kunden wollen Termine. Sofort.“ |
| 0:07–0:14 | **Die Lösung** — WhatsApp öffnet sich, Kunde tippt die Terminanfrage |
| 0:14–0:25 | **Die KI übernimmt** — versteht Anfrage, fragt Fahrzeugdaten ab, bietet echte freie Slots als Antwort-Chips |
| 0:25–0:34 | **Automatische Buchung** — Kunde tippt „Mittwoch 11 Uhr 👍“, Buchung fliegt animiert in den Werkstatt-Kalender |
| 0:34–0:41 | **Menschliche Übergabe** — KI-Modus schaltet sichtbar auf MITARBEITER, Max übernimmt |
| 0:41–0:50 | **Das Ergebnis** — 4 Check-Punkte, Kalender füllt sich von allein |
| 0:50–0:58 | **Finale** — WhatsApp → KI → Kalender, Claim „WhatsApp rein. Termin drin.“ + 0-€-Hinweis mit Disclaimer |

Das Video hat ein deutsches Voiceover (lokal synthetisiert mit Piper TTS, Stimme
„Thorsten“) — alle Sprechertexte laufen zusätzlich als Untertitel mit, das Video
funktioniert also auch stumm (Social-Media-Autoplay). Details und Timecodes in
[`VOICEOVER.md`](VOICEOVER.md); dort steht auch, wie man eine eigene Sprecher-Aufnahme einmischt.

## Neu rendern

```bash
npm install                                    # playwright-core, ffmpeg-static, Inter
node audio/make_audio.mjs                      # Tonspur → audio/soundtrack.wav
node render/render.mjs --video --audio audio/soundtrack.wav
                                               # → out/tuv-assistant-werbevideo.mp4
```

Chromium wird über `PLAYWRIGHT_BROWSERS_PATH` bzw. `/opt/pw-browsers` gefunden;
alternativ einen eigenen Pfad in `render/render.mjs` → `findChromium()` eintragen.

### Vorschau im Browser (Echtzeit)

```bash
python3 -m http.server 8080
# → http://localhost:8080/film/index.html   (Leertaste = Pause, ←/→ = ±1 s)
```

### Einzelne Frames prüfen

```bash
node render/render.mjs --snap 3.5,29.4,53.9   # → out/frames-qa/*.png
```

## Wie es funktioniert

- **`film/index.html`** — der komplette Film. Jede Animation ist eine reine Funktion
  der Zeit `t` (`window.FILM.seekTo(t)`), dadurch ist jedes Frame exakt reproduzierbar:
  Chat-Scroll, Bubble-Pops, Tipp-Animation in der Eingabezeile, Orb-Flug zum Kalender,
  Modus-Flip KI→Mitarbeiter, Check-Zeichnungen, Finale-Lockup.
- **`render/render.mjs`** — Playwright steuert Chromium, macht pro Frame einen
  JPEG-Screenshot und pipet ihn direkt in ffmpeg (libx264, CRF 19, `+faststart`).
- **`audio/make_audio.mjs`** — synthesizert die komplette Tonspur in Node (ohne
  Samples): origineller 80s-Soul/Funk-Groove bei 106 BPM (Am9↔D9-Vamp, Fmaj7/G6-Bridge): swingende Drums, funky Bassriff, Rhodes-Stabs, Snaps —
  dazu ein deutsches Voiceover (Piper TTS „Thorsten emotional/amused", lokal, mit automatischem Ducking) und szenengenaue Sound-Effekte (Klingeln, WhatsApp-Blips, Whooshes, Buchungs-Chime,
  Check-Pops, Finale-Impact) — sample-genau auf die Film-Timeline gesetzt.

## Anpassen

- Texte/Chat: direkt in `film/index.html` (Markup der Bubbles bzw. `CAPTIONS`).
- Timing: Konstanten-Objekt `T` in `film/index.html` — Audio-Events in
  `audio/make_audio.mjs` ggf. passend nachziehen.
- Farben: CSS-Variablen am Dateianfang (`--green`, `--blue`, …).
