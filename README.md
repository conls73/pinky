# Pinky 💗

**A work‑finding scout.** Upload a resume, pick your area, and Pinky returns ranked local
jobs, gigs, and temp work — with *why each one fits* — plus a ready‑to‑send apply message.

One Expo (React Native) codebase runs on **iOS, Android, and web (desktop)**.

## Run it

```bash
npm install
npx expo start
```

- Press **`w`** to open the web (desktop) app.
- Scan the QR code with **Expo Go** on a phone for mobile.

The full flow works **without any API keys** — Pinky falls back to sample leads and
template messages so you can click through end‑to‑end. Add keys to turn on the real AI.

## Add the AI + live jobs (optional)

Copy `.env.example` to `.env` and fill in:

```
ANTHROPIC_API_KEY=...   # Claude: resume parsing, lead ranking, apply messages
SEARCHAPI_KEY=...       # SearchApi.io Google Jobs (the live job source)
```

Secrets are read **only** inside the server API routes (`app/*+api.ts`) — never shipped to
the client.

## Flow

`Login (Skip bypass)` → `Home` → `Resume upload` → `Area + radius` → `Preferences` →
`Results (ranked + why it fits)` → `Lead detail + apply/follow‑up message`.

## Structure

| Path | What |
|------|------|
| `app/index.tsx` | All‑pink login + **Skip for now** bypass |
| `app/home.tsx` `app/resume.tsx` `app/area.tsx` `app/preferences.tsx` `app/results.tsx` `app/lead/[id].tsx` | Screens (the MVP flow) |
| `app/parse-resume+api.ts` `app/search+api.ts` `app/message+api.ts` | Server routes (Claude + jobs) |
| `lib/jobSources/` | Pluggable sources — Google Jobs (live) + Thumbtack/Indeed/LinkedIn/ZipRecruiter (stubs) |
| `lib/anthropic.ts` | Claude client + prompt‑caching helpers |
| `store/usePinky.ts` `types/` `theme/colors.ts` `components/` | State, types, pink theme, UI |

## Next

- **Auth + storage → Supabase** (replaces the bypass; saves profiles, leads, history).
- Real Thumbtack / Indeed / LinkedIn / ZipRecruiter integrations behind the existing
  `JobSource` adapters (need their official/partner APIs — see `lib/jobSources/stubs.ts`).
