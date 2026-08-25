# Debugging — Anti-Kaskaden-Prompt

```
FEHLER-SYMPTOM:
[Exakte Fehlermeldung oder vollständiger Stacktrace — nicht paraphrasieren, einfügen.]

REPRODUKTION:
[Wie löse ich ihn aus. z. B. "POST /api/login mit Passwort das ein & enthält."]

ERWARTETES VERHALTEN:
[z. B. "Login-Endpunkt gibt 401 zurück, statt mit 500 zu crashen."]

SCOPE:
[Wo ich den Fehler vermute. z. B. "Vermutlich src/auth/*. Bitte nur dort suchen."]

STRIKTE ANWEISUNG:
1. Fehler erst reproduzieren. Ohne Repro kein Fix.
2. Kernursache isolieren und belegen. Nicht das Symptom maskieren
   (keine leeren catch-Blöcke, kein @ts-ignore, kein any).
3. Absolut minimalen Fix anwenden — so wenige Zeilen wie möglich.
4. KEINE anderen Fehler beheben, die dir auffallen. Ein Bug, ein Fix.
   Sonstige Funde am Ende auflisten, nicht anfassen.
5. Danach [DEIN TESTKOMMANDO] ausführen und das Ergebnis zeigen.
```

**Warum der Scope wichtig ist:** ohne Eingrenzung wandert der Agent durch fremde Module und "repariert" Dinge, die nicht kaputt waren.
