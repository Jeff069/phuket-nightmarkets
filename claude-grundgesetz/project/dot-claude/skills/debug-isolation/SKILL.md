---
name: debug-isolation
description: Vier-Schritt-Methodik gegen Fehlerkaskaden beim Debugging. Nutzen bei Bugs, Exceptions, Stacktraces, fehlschlagenden Tests, falschem Verhalten zur Laufzeit oder wenn etwas "plötzlich nicht mehr geht".
---

# Debug-Isolation

Ein Bug, ein Fix. Raten ist verboten.

## Schritt 1 — Reproduzieren

- Fehler zuerst selbst auslösen. Ohne Repro kein Fix.
- Vollständige Ausgabe erzeugen (`--verbose`, Debug-Log-Level, kompletter Stacktrace).
- Festhalten: exakter Auslöser, exakte Fehlermeldung, exakte Zeile.
- Lässt er sich nicht reproduzieren: das sagen und fragen, unter welchen Bedingungen er auftritt. Nicht spekulativ patchen.

## Schritt 2 — Isolieren

Über 80 % der Fehler stecken in den jüngsten Änderungen.

- `git log --oneline -15` und `git diff HEAD~1` — was hat sich zuletzt geändert?
- Bei unklarem Zeitpunkt: `git bisect`.
- Scope explizit eingrenzen und benennen: *"Ich sehe mir nur `src/auth/*` an."*
- Dann die Kernursache belegen — nicht vermuten. Wer nicht zeigen kann, *warum* der Fehler auftritt, hat ihn nicht gefunden.
- Hypothese vor dem Fix aussprechen: *"X passiert, weil Y."*

## Schritt 3 — Minimaler Fix

- So wenige Zeilen und Dateien wie möglich.
- Kernursache beheben, nicht das Symptom maskieren.
- **Verboten:** leerer `catch`-Block, `except: pass`, `@ts-ignore`, `any`, entfernte Assertion, hochgesetztes Timeout, auskommentierter Test.
- **Anti-Kaskade:** Keine anderen Fehler beheben, die unterwegs auffallen. Notieren, am Ende auflisten, separat angehen.
- Kein Refactoring "bei der Gelegenheit".

## Schritt 4 — Verifizieren

- Testkommando selbst ausführen und die Ausgabe lesen.
- Erst prüfen: schlägt der Test **vor** dem Fix fehl und **nach** dem Fix nicht mehr? Existiert kein solcher Test, einen schreiben.
- Die volle Suite laufen lassen — kein neuer Fehler darf entstanden sein.
- Bleibt es rot: zurück zu Schritt 2. Nicht denselben Fix variieren.

## Abbruchbedingung

Nach zwei erfolglosen Versuchen am selben Bug: stoppen. Berichten, was probiert wurde, was ausgeschlossen ist und welche Hypothesen offen sind. Kein dritter Blindversuch.

## Abschlussbericht

```
URSACHE:     <warum es passiert ist>
FIX:         <was geändert wurde, in welchen Dateien>
VERIFIKATION: <kommando + ergebnis>
OFFEN:       <unterwegs gesehene, nicht angefasste Probleme>
```
