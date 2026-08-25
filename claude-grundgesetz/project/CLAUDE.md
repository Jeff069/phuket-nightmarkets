# Projekt-Verfassung

> Ergänzt das globale Grundgesetz in `~/.claude/CLAUDE.md`, hebt es nicht auf.
> Alles in eckigen Klammern ersetzen. Alles, was das Modell ohnehin weiß, ersatzlos löschen.
> Faustregel: passt nicht auf eine Bildschirmseite, ist zu viel drin.

## 1. Stack

- Framework: [z. B. Next.js 14, App Router]
- Sprache: [z. B. TypeScript, strict mode]
- Datenbank/ORM: [z. B. Prisma + PostgreSQL]
- Paketmanager: [z. B. pnpm]
- Testing: [z. B. Vitest + Playwright]

## 2. Kommandos

- Test: `[npm test]`
- Einzeltest: `[npm test -- <pfad>]`
- Lint: `[npm run lint]`
- Typecheck: `[npm run typecheck]`
- Build: `[npm run build]`
- Dev-Server: `[npm run dev]`

Vor jedem Commit laufen: Lint, Typecheck, betroffene Tests.

## 3. Hard Rules

- Ausschließlich Named Exports, keine Default Exports.
- Alle API-Antworten nutzen exakt `{ data, error, status }`.
- Tests liegen in `[__tests__/]` und spiegeln die `src/`-Struktur 1:1.
- Keine hardcodierten Secrets — immer über die bestehenden Umgebungsvariablen.
- Authentifizierung ausschließlich über `[src/middleware/auth.ts]`. Keine eigene Auth-Logik.
- [Weitere projektspezifische Regel]

## 4. Do Not

- Datenbankschema NIEMALS ohne ausdrückliche Erlaubnis ändern.
- Auth-Logik NIEMALS ändern.
- Keine neuen Dependencies ohne Rückfrage.
- [`src/legacy/**` nicht anfassen — wird separat migriert.]

## 5. Architektur-Notizen

Nur Entscheidungen, die man dem Code nicht ansieht:

- [z. B. "Server Components sind Default. `use client` nur für Interaktivität — begründen."]
- [z. B. "Datenzugriff nur über `src/data/*`. Komponenten sprechen nie direkt mit Prisma."]
