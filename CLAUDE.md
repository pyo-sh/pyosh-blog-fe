# Client CLAUDE.md

> Next.js App Router + TailwindCSS v4 작업 가이드

## 🏗️ 기술 스택

- Next.js 14.2.35 (App Router)
- React 18.2.0
- TypeScript 5.9.3
- TailwindCSS 4.1.18
- ESLint 9.39.2

## 📂 주요 경로

```
client/
├── src/
│   ├── app/                # Next.js App Router
│   ├── app-layer/          # 앱 진입점 & 글로벌 설정
│   ├── entities/           # 비즈니스 엔티티
│   ├── features/           # 사용자 인터랙션 기능
│   ├── shared/             # UI, hooks, utils
│   └── widgets/            # 독립적인 UI 블록 (헤더, 사이드바 등)
└── eslint.config.js        # ESLint 9 Flat
```

## 💻 명령어

```bash
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
pnpm compile:types
```

## 📝 코딩 규칙

- **파일**: kebab-case
- **컴포넌트**: PascalCase, export
- **상호작용 필요 시**: `"use client"` 추가
- **스타일**: TailwindCSS 클래스 사용
- **유틸리티**: `cn()` 함수 사용 (clsx + twMerge)
- **테마**: `useToggleTheme` 훅 사용

## 🎨 TailwindCSS v4

- **설정 파일**: `src/app-layer/style/index.css` (여러 css 파일의 진입점)
- **토큰 네이밍**: kebab-case (예: `bg-background-1`)
- **@apply**: 빌트인 유틸리티만 가능

---

## 워크플로

전역 `CLAUDE.md`의 작업 선택 규칙과 `/dev-workflow` 스킬을 따른다.
기록은 모두 `docs/client/`에 저장된다.
