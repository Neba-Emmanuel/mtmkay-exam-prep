# MTMKay Exam Prep

A student and administrator portal for exam practice, practical questions, results, subscriptions, and study assistance. The Next.js application connects to the dedicated exam-preparation API.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Zustand.

**Companion repository:** [Neba-Emmanuel/mtmkay-exam-prep-backend](https://github.com/Neba-Emmanuel/mtmkay-exam-prep-backend).

## Quick start

Use Node.js 24 and npm. Run all commands from this repository root. Install the committed dependency versions:

```sh
npm ci
```

Create an ignored local configuration file from the sanitized example:

```sh
cp .env.example .env.local
```

Application secrets for deployed environments are managed in Vercel project settings. You do not need to copy those secrets into this checkout for build and type checks. Configure public development values below, then start the app:

```sh
NEXT_PUBLIC_API_URL=http://localhost:3001/api npm run dev -- --port 3000
```

## Configuration

| Variable | Purpose | Development setting |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser API base, including `/api`. | http://localhost:3001/api |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site origin. | your public site origin |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Read by the current browser AI integration; exposed to clients. | do not put a private key here |

Production builds fetch the Inter font through `next/font/google`, requiring `fonts.googleapis.com` and `fonts.gstatic.com`. The existing browser Gemini integration reads a public key. Move private AI calls behind a server endpoint in a separate coding change; removing a tracked file alone cannot protect a key shipped to browsers. `NEXT_PUBLIC_HF_API_KEY` appeared in the previously committed local environment file but was not found in active source references. No automated test suite is declared.

`NEXT_PUBLIC_*` and `VITE_*` variables are included in browser code. Use them only for public configuration. Restart the development server after changing environment variables; rebuild to change production browser configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development workflow. |
| `npm run build` | Compile the production application. |
| `npm start` | Run the compiled production server. |
| `npm run lint` | Run the declared lint script; inspect compatibility notes above. |

## Validate changes

```sh
npm run build
npm run lint
```

Onboarding validation: production build and TypeScript checking passed. The frontend served locally against the development API. Lint currently reports 24 existing errors; they require a separate code cleanup.

## Project layout

| Path | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, with student, admin, and authentication route groups. |
| `src/components/` | Study, marketing, subscription, and shared components. |
| `src/lib/` | API client, session helpers, SEO, and AI integration. |
| `src/store/` | Authentication and exam state. |
| `middleware.ts` | Request middleware. |

## Environment-file security

`.env.local` is excluded from Git tracking, and `.env` plus environment variants are ignored. Only the sanitized `.env.example` should be committed. Credentials found in previously committed environment files remain exposed in Git history: revoke or rotate them with the issuing providers and replace the corresponding Vercel bindings. Removing a file from the latest revision does not remove earlier versions. Coordinate any history cleanup with collaborators after rotation.

Never paste secrets into issues, logs, documentation, or browser-visible variables.
