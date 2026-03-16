# Frontend — Morgan's Hope

React 18 + Vite + TypeScript. Port **3001**.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Opens http://localhost:3001. Set `VITE_API_URL` if the API is not at the same host (e.g. production).

## Build

```bash
npm run build
```

Output: `dist/`. For production deploy (e.g. Netlify) use **Publish directory:** `dist`.

## Structure

- `src/App.tsx` — Routes and layout
- `src/main.tsx` — Entry, AuthProvider
- `src/pages/` — Home, Upload, Results, Login, Register, Profile, About, Contact, Hospitals, ChatBot
- `src/components/` — Navbar, Footer, guards, animations
- `src/context/AuthContext.tsx` — Auth state and token refresh
- `src/utils/api.ts` — Axios instance, interceptors, base URL

API base URL: `import.meta.env.VITE_API_URL` or `/api` (proxy in dev).
