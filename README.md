# Centrum Otulone — Wirtualny Pomocnik (Chatbot)

Inteligentny chatbot FAQ dla [centrumotulone.pl](https://centrumotulone.pl) — centrum terapeutycznego dla kobiet w Gdańsku.

Widget ładuje się przez **jeden tag `<script>`**, działa na każdej stronie WordPress bez żadnej konfiguracji. Nie wymaga żadnych płatnych API — działa całkowicie za darmo.

---

## Funkcje

- Odpowiada na pytania o cennik, usługi, umawianie wizyt, dojazd, specjalistki
- **Safety Mode** — automatycznie wykrywa sygnały kryzysu (myśli samobójcze, przemoc domowa, samookaleczenie) i wyświetla kontakty kryzysowe zamiast zwykłej odpowiedzi
- Sugerowane pytania przy pierwszym otwarciu
- Logowanie nieznanych pytań do localStorage + eksport do JSON (dla webmastera)
- Shadow DOM — pełna izolacja CSS od motywu WordPress
- Działa offline — żadnych zewnętrznych zapytań API

---

## Uruchomienie lokalne

### Wymagania

- Node.js 18+
- npm 9+

### Instalacja

```bash
npm install
```

### Start

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) — zobaczysz stronę demo z działającym widgetem w prawym dolnym rogu.

### Zmiana bazy wiedzy

Edytuj plik [`data/knowledge.json`](data/knowledge.json) — możesz dodawać nowe intenty, słowa kluczowe i odpowiedzi.

Po każdej zmianie przebuduj widget:

```bash
node scripts/build-widget.mjs
```

Lub uruchom tryb watch (automatyczny rebuild przy każdej zmianie):

```bash
npm run build:widget:watch
```

---

## Deploy na Vercel

### Przez GitHub (zalecane)

1. Wgraj projekt na GitHub (publiczne lub prywatne repo)
2. Wejdź na [vercel.com](https://vercel.com) i zaloguj się
3. Kliknij **Add New → Project** i wybierz repozytorium
4. Vercel automatycznie wykryje Next.js — kliknij **Deploy**
5. Po kilku minutach projekt jest dostępny pod adresem np. `https://centrum-otulone-chatbot.vercel.app`

### Przez Vercel CLI

```bash
npm install -g vercel
vercel
```

### Uwaga

Każdy nowy deploy automatycznie przebudowuje widget (`npm run build` wywołuje `build:widget` przed buildem Next.js).

---

## Osadzenie widgetu na WordPress

Wklej poniższy kod **przed tagiem `</body>`** w WordPressie.

Najprościej przez wtyczkę **Insert Headers and Footers** (lub analogiczną):
- Zakładka **Footers** → wklej kod → Zapisz

```html
<script
  src="https://centrum-otulone-chatbot.vercel.app/widget.js"
  async
></script>
```

Widget pojawi się automatycznie na wszystkich stronach jako pływający przycisk w prawym dolnym rogu. Nie wymaga żadnej dodatkowej konfiguracji.

---

## Eksport nieznanych pytań

Gdy chatbot nie zna odpowiedzi na pytanie użytkownika, zapisuje je lokalnie w przeglądarce (localStorage).

Aby pobrać listę tych pytań i uzupełnić bazę wiedzy:

1. Otwórz stronę demo: [https://centrum-otulone-chatbot.vercel.app](https://centrum-otulone-chatbot.vercel.app)
2. Kliknij **Eksportuj nieznane pytania (.json)**
3. Otwórz pobrany plik i dodaj brakujące odpowiedzi do `data/knowledge.json`
4. Przebuduj widget i wgraj nową wersję na Vercel

---

## Stack techniczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Widget bundle | esbuild (IIFE, ES2018) |
| CSS izolacja | Shadow DOM |
| Logika dopasowania | Keyword intent matching (bez AI) |
| Hosting | Vercel (free tier) |
| Baza wiedzy | JSON (lokalny plik) |
| Płatne API | **Brak — 0 zł/miesiąc** |

---

## Struktura projektu

```
├── app/                  # Next.js app (strona demo + API)
│   └── components/       # ExportButton i inne komponenty
├── data/
│   └── knowledge.json    # Baza wiedzy — intenty, słowa kluczowe, odpowiedzi
├── lib/
│   ├── matcher.ts        # Logika dopasowania pytań do odpowiedzi
│   └── logger.ts         # Logowanie nieznanych pytań
├── widget-src/           # Źródła widgetu (React + TypeScript)
│   ├── index.tsx         # Entry point — Shadow DOM mount
│   ├── ChatWidget.tsx    # Główny komponent czatu
│   └── styles.ts         # Style CSS (wstrzykiwane do Shadow DOM)
├── public/
│   └── widget.js         # Zbudowany widget (generowany automatycznie)
└── scripts/
    └── build-widget.mjs  # Skrypt budujący widget przez esbuild
```

---

## Kontakt

Centrum Otulone · Gdańsk · [centrumotulone.pl](https://centrumotulone.pl) · 573 909 822
