# UI-Arbeit — Beweispflicht statt vager Ziele

**Schlecht:** "Mach das Dashboard schöner."
**Gut:**

```
[Screenshot/Design eingefügt]

Implementiere dieses Design in [datei].

Danach:
1. Erstelle einen Screenshot des Resultats.
2. Vergleiche ihn mit dem Original.
3. Liste die Abweichungen konkret auf (Abstände, Farben, Schriftgrößen, Ausrichtung).
4. Korrigiere sie autonom und wiederhole ab Schritt 1, bis es passt.
```

Das Prinzip gilt überall: **das Modell muss den Erfolg belegen, nicht behaupten.**

| Aufgabe | Geforderter Beweis |
|---|---|
| Bugfix | Test schlägt vorher fehl, nachher nicht |
| Performance | Messung vorher/nachher mit Zahlen |
| UI | Screenshot-Vergleich mit Abweichungsliste |
| Refactoring | Suite grün, Verhalten unverändert |
| API | Echter Request mit Response-Body |
