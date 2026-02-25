# Client — Next.js Frontend

Blog public pages + admin pages. FSD (Feature-Sliced Design) architecture.

## Tech Stack

Next.js 14.2 (App Router) / React 18.2 / TypeScript 5.9 / TailwindCSS 4.1 / ESLint 9

## Commands

```bash
pnpm dev              # http://localhost:3000
pnpm build
pnpm lint
pnpm compile:types    # type check
```

## Directory Structure (FSD)

```
src/
├── app/               # Next.js App Router (routing only)
├── app-layer/         # Global config, providers, style entry point
├── widgets/           # Independent UI blocks (header, sidebar, etc.)
├── features/          # User interaction feature units
├── entities/          # Business entities (post, category, etc.)
└── shared/            # Common modules
    ├── ui/            # Reusable UI components
    ├── api/           # API client
    ├── lib/           # Utilities (cn, etc.)
    ├── hooks/         # Common hooks
    └── constant/      # Constants
```

Import direction: `app → widgets → features → entities → shared` (reverse forbidden)

## Coding Patterns

```typescript
// Components: PascalCase, named export
export function PostCard({ post }: PostCardProps) { ... }

// Components requiring interactivity
"use client";

// Class merging
import { cn } from '@/shared/lib/utils';
<div className={cn('base-class', conditional && 'active')} />

// Theme toggle
const { toggleTheme } = useToggleTheme();
```

## TailwindCSS v4

- Config entry point: `src/app-layer/style/index.css`
- Custom tokens: kebab-case (`bg-background-1`, `text-foreground-2`)
- `@apply`: built-in utilities only

## Workflow

Follow root `CLAUDE.md` task rules. Records go in `docs/client/`.
