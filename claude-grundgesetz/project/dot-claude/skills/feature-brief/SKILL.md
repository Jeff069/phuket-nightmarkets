---
name: feature-brief
description: Erzwingt Explore-Plan-Implement-Commit für neue Features. Nutzen, wenn ein neues Feature, Endpunkt, Modul oder eine größere Erweiterung gebaut werden soll, oder wenn ein Auftrag mehr als drei Dateien berührt.
---

# Feature-Brief

Kein Code, bevor der Plan freigegeben ist.

## Phase 1 — Explore

- Relevante Dateien tatsächlich lesen. Bestehende Muster für dieselbe Aufgabe suchen (`grep`, `glob`).
- Feststellen: Welche Konventionen gelten hier schon? Was kann wiederverwendet werden?
- Ist der Auftrag mehrdeutig, jetzt fragen — nicht nach dem halben Feature.

## Phase 2 — Plan

Ausgeben, danach **stoppen** und auf Freigabe warten:

```
ZIEL:            <ein Satz>
BETROFFENE DATEIEN: <Liste, mit neu/geändert markiert>
ANNAHMEN:        <was ich unterstelle, weil es nicht spezifiziert war>
RISIKEN:         <was brechen könnte>

CHECKPOINTS
1. <kleinste sinnvoll committbare Einheit> — verifiziert durch: <kommando>
2. …
```

Regeln für Checkpoints:
- Jeder Checkpoint ist eigenständig committbar und lässt das Projekt grün.
- Jeder Checkpoint hat ein konkretes Verifikationskommando.
- Mehr als fünf Checkpoints heißt: Feature ist zu groß, Aufteilung vorschlagen.

## Phase 3 — Implement

- Ein Checkpoint nach dem anderen. Nicht vorgreifen.
- Nichts anfassen, was nicht im Plan steht. Wird unterwegs etwas Zusätzliches nötig: melden, nicht einfach tun.
- Ergibt sich, dass der Plan falsch war: stoppen, Plan korrigieren, neu freigeben lassen.

## Phase 4 — Commit

Nach jedem verifizierten Checkpoint sofort committen (siehe Skill `commit-message`). Nicht sammeln.

## Abschluss

Kurzer Bericht: was gebaut wurde, was verifiziert wurde und wie, was bewusst offen blieb.
