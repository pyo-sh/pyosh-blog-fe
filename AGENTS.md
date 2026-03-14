# client — pyo-sh/pyosh-blog-fe

Stack: Next.js 14.2 App Router · React 18.2 · TypeScript 5.9 · TailwindCSS 4.1

## Commands

| | Command |
|-|---------|
| verify | `pnpm compile:types && pnpm lint && pnpm build` |
| dev | `pnpm dev` |

## Architecture

FSD layers — strict import order: `app → widgets → features → entities → shared`

- `src/app/` — routing only; no business logic
- Reverse imports are FORBIDDEN — halt task and report violation

## Pre-task

Read `../docs/client/decisions.index.md` before changing architecture or conventions.
