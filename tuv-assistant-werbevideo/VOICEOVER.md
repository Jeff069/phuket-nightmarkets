# Voiceover

Das Video enthält bereits ein deutsches Voiceover: lokal synthetisiert mit dem
Coqui-VITS-Modell **`vits-coqui-de-css10`** (via sherpa-onnx) — eine helle, weiche,
sehr gleichmäßig fließende Stimme — anschließend veredelt mit einer Studio-Kette
(Hochpass, Entmulmung bei 350 Hz, Präsenz bei 3 kHz, Höhen-Shelf, Kompressor,
Limiter). Gemischt mit automatischem Ducking (Musik senkt sich unter der Stimme ab).

## Timecodes

| Timecode | Text |
|---|---|
| 00:01,0 – 00:06,7 | Das Telefon klingelt. Die Werkstatt ist voll. Und der nächste Kunde möchte einfach nur einen Termin. |
| 00:10,2 – 00:13,5 | Was wäre, wenn WhatsApp das ab jetzt einfach selbst erledigt? |
| 00:15,6 – 00:24,2 | Eine künstliche Intelligenz versteht die Anfrage, fragt alle benötigten Fahrzeugdaten ab – und prüft automatisch die tatsächlich verfügbaren Termine. |
| 00:28,4 – 00:32,5 | Der Kunde wählt seinen Termin – und die Buchung landet automatisch im Kalender. |
| 00:36,8 – 00:39,8 | Und sobald ein Mensch gebraucht wird, übernimmt die Werkstatt. |
| 00:43,4 – 00:48,5 | Weniger Unterbrechungen. Weniger Verwaltungsarbeit. Mehr Service für den Kunden. |
| 00:52,5 – 00:57,0 | Der digitale TÜV-Assistent. WhatsApp rein. Termin drin. |

## Sprachdateien neu erzeugen

Die fertigen Zeilen liegen als `audio/vo/vo1.wav` … `vo7.wav` im Repo — der
Mix (`node audio/make_audio.mjs`) braucht nur diese Dateien. Zum Neu-Einsprechen:

```bash
pip install sherpa-onnx
cd audio/vo
curl -sSL -o css10.tar.bz2 \
  https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-coqui-de-css10.tar.bz2
tar xjf css10.tar.bz2
# Synthese: sherpa_onnx.OfflineTts mit model.onnx + tokens.txt, sid=0
# danach Politur pro Datei (ffmpeg):
#   highpass=f=90, equalizer 350Hz -2dB, equalizer 3kHz +2dB, treble +2.5dB,
#   acompressor 2.5:1, alimiter 0.93, aresample=44100
```

Danach Tonspur + Video neu bauen:

```bash
node audio/make_audio.mjs
FF=$(node -p "require('ffmpeg-static')")
"$FF" -y -i out/tuv-assistant-werbevideo.mp4 -i audio/soundtrack.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart out/neu.mp4
```

## Profi-Sprecher statt TTS

Eigene Aufnahme (WAV, 44,1 kHz) einfach als `vo1.wav` … `vo7.wav` in `audio/vo/`
legen — Längen an die Timecode-Fenster oben anlehnen — und den Mix neu bauen.
Ducking und Platzierung passieren automatisch.
