# Voiceover-Skript mit Timecodes

Sprecher: männlich oder weiblich, ruhig, seriös, leicht warm. Tempo zügig, nicht gehetzt.
Die Zeilen laufen im Video bereits als Untertitel mit — das Voiceover ersetzt sie nicht,
sondern verstärkt sie. Empfohlene Aussteuerung: Musikbett beim VO um ca. −6 dB ducken.

| Timecode | Text |
|---|---|
| 00:01,2 – 00:06,1 | Telefon klingelt. Die Werkstatt ist voll. Und der nächste Kunde möchte einfach nur einen Termin. |
| 00:10,2 – 00:13,5 | Was wäre, wenn WhatsApp das ab jetzt einfach selbst erledigt? |
| 00:15,6 – 00:24,3 | Eine KI versteht die Anfrage, fragt alle benötigten Fahrzeugdaten ab und prüft automatisch die tatsächlich verfügbaren Termine. |
| 00:28,2 – 00:33,4 | Der Kunde wählt seinen Termin – und die Buchung landet automatisch im Kalender. |
| 00:36,6 – 00:40,5 | Und sobald ein Mensch gebraucht wird, übernimmt die Werkstatt. |
| 00:43,2 – 00:49,3 | Weniger Unterbrechungen. Weniger Verwaltungsarbeit. Mehr Service für den Kunden. |
| 00:52,6 – 00:56,5 | Der digitale TÜV-Assistent. WhatsApp rein. Termin drin. |

## VO einmischen (wenn Aufnahme vorliegt)

```bash
FF=$(node -p "require('ffmpeg-static')")
"$FF" -i out/tuv-assistant-werbevideo.mp4 -i voiceover.wav \
  -filter_complex "[0:a]volume=0.55[bed];[bed][1:a]amix=inputs=2:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k out/tuv-assistant-werbevideo-vo.mp4
```
