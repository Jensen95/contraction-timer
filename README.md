# Contraction Timer

A modern, mobile-friendly Progressive Web App (PWA) for tracking labor contractions in real time.

## Features

- One-tap start/end contraction tracking
- Automatic labor stats (duration, interval, labor time, and 5-1-1 indicator)
  - 5-1-1 means contractions are 5 minutes apart, last at least 1 minute, for at least 1 hour
- Visual timeline and detailed contraction log
- Edit and delete individual entries
- Export contractions as CSV or share via native share sheet
- Offline-first support with service worker
- Theme support (auto, light, dark)
- English and Danish language support

## Tech Stack

- [Svelte 5](https://svelte.dev/) + TypeScript
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/) + Testing Library
- `vite-plugin-pwa`

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Scripts

- `npm run dev` — start dev server
- `npm run check` — run Svelte + TypeScript checks
- `npm run lint` — run linting
- `npm test` — run tests
- `npm run build` — build production bundle
- `npm run preview` — preview production build

## Privacy

Contraction data is stored locally in your browser (`localStorage`) and can be exported by the user.  
No contraction data is sent to external servers by the app.
