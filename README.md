# pyosh-blog-fe

> Work in progress. This guide covers local setup and development conventions.

## Local setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.local.example .env.local

# 3. Start the dev server
pnpm dev
```

The dev server runs at `http://localhost:3000`.

The app fetches images from `localhost:5500` (local API server), `api.pyosh.com`, GitHub-hosted image domains, Notion-hosted image domains, and Naver image domains by default. Make sure the backend is running locally or point the relevant env vars to a remote instance.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm compile:types` | Type-check without emitting |

## Architecture

Follows [Feature-Sliced Design (FSD)](https://feature-sliced.design/).

### Layers

```
app           → Next.js routing only (no business logic)
app-layer     → Cross-cutting app setup (providers, layouts)
widgets       → Composable page sections
features      → User interactions and use cases
entities      → Domain models and API calls
shared        → Reusable UI, utils, config
```

Import direction is strictly top-down. Importing from a lower layer into a higher layer is not allowed (e.g. `entities` must not import from `features`).

### Path aliases

```ts
@app/*        → src/app/*
@app-layer/*  → src/app-layer/*
@widgets/*    → src/widgets/*
@features/*   → src/features/*
@entities/*   → src/entities/*
@shared/*     → src/shared/*
@/*           → src/*
```

## Code conventions

- Strict TypeScript - no `any`, no `as` casts without justification.
- Tailwind classes only - no inline styles or CSS modules outside of `shared`.
- Components are colocated with their slice; generic UI belongs in `shared/ui`.
- ESLint and Prettier are enforced. Run `pnpm lint` before pushing.
