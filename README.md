# pyosh-blog-fe

pyosh-blog의 Next.js 프론트엔드입니다. 공개 블로그 페이지와 `/manage` 관리자 페이지를 포함하며, App Router와 Feature-Sliced Design 구조를 기준으로 개발합니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js 14.2 App Router |
| UI runtime | React 18 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Data fetching | TanStack Query 5 |
| Component docs | Storybook 10 |
| Package manager | pnpm |

## 사전 요구사항

- Node.js 18.17 이상
  - 이 프로젝트는 Next.js 14 계열입니다. Next.js 14 공식 요구사항은 Node.js 18.17 이상입니다.
- pnpm
  - `pnpm-lock.yaml`을 기준으로 의존성을 설치합니다.
- API 서버
  - 로컬 기본값은 `http://localhost:5500`입니다.
  - 서버 저장소는 monorepo 기준 `/server`에 있으며, 별도 터미널에서 실행합니다.

## 빠른 시작

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 환경 변수

로컬 개발은 `.env.local.example`을 복사해서 시작합니다.

```bash
cp .env.local.example .env.local
```

현재 예시 파일은 다음 변수를 제공합니다.

| 변수 | 실행 위치 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser | 브라우저에서 API 서버로 요청할 때 사용하는 공개 API URL |
| `API_URL` | Next.js server | RSC, middleware 등 서버 측 코드에서 API 서버로 요청할 때 사용하는 내부 API URL |
| `NEXT_PUBLIC_SITE_URL` | Browser | canonical URL, 메타데이터, 공유 URL 등에 사용하는 공개 사이트 URL |

주의사항:

- 실제 secret, 개인 토큰, 운영 DB 주소, 세션 키는 README나 Issue, PR에 적지 않습니다.
- `.env.local`, `.env.production`, `.env*.local` 파일은 커밋하지 않습니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 노출될 수 있습니다. 비밀 값에는 이 접두사를 붙이지 않습니다.
- `NEXT_PUBLIC_` 값은 빌드 시점에 클라이언트 번들에 반영됩니다. 배포 환경 값을 바꾸는 경우 새로 빌드해야 합니다.
- `API_URL`이 비어 있으면 앱 코드에서 `NEXT_PUBLIC_API_URL`로 폴백할 수 있습니다. 서버 전용 내부 URL이 필요하면 `.env.local`에 별도로 설정합니다.

## 개발 서버

```bash
pnpm dev
```

`next dev`는 개발 서버를 시작합니다. Next.js는 개발 중 방문한 route를 필요할 때 컴파일하므로, 전체 프로덕션 빌드보다 빠르게 피드백을 받을 수 있습니다.

로컬에서 API 연동까지 확인하려면 서버도 실행합니다.

```bash
(cd ../server && pnpm dev)
```

위 명령은 monorepo checkout에서 `client` 디렉터리에 있을 때의 예시입니다. server 저장소를 따로 clone했다면 해당 server repo root에서 `pnpm dev`를 실행합니다.

## 주요 스크립트

| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 생성 |
| `pnpm start` | `pnpm build` 결과를 사용하는 프로덕션 서버 실행 |
| `pnpm lint` | `src` 디렉터리 ESLint 검사 |
| `pnpm compile:types` | TypeScript 타입 검사 |
| `pnpm storybook` | Storybook을 `http://localhost:6006`에서 실행 |

## 빌드와 프로덕션 실행

```bash
pnpm build
pnpm start
```

- `next build`는 프로덕션용 애플리케이션을 생성합니다.
- `next start`는 빌드된 결과를 Node.js 서버로 실행합니다.
- `next start`는 먼저 `pnpm build`가 성공한 뒤 사용합니다.

PR 전에는 monorepo의 client 검증 명령을 기준으로 확인합니다.

```bash
pnpm compile:types
pnpm lint
pnpm build
```

## Storybook

```bash
pnpm storybook
```

Storybook은 공유 UI, 위젯, 주요 상태 조합을 브라우저에서 확인할 때 사용합니다. 실행 주소는 `http://localhost:6006`입니다.

## 프로젝트 구조

```text
src/
  app/         Next.js routing only
  app-layer/   Providers, global styles, theme setup
  widgets/     Page-level composed sections
  features/    User interactions and use cases
  entities/    Domain models and API functions
  shared/      Reusable UI, hooks, libs, config
```

이 프로젝트는 [Feature-Sliced Design](https://feature-sliced.design/)을 따릅니다.

레이어 의존 방향은 위에서 아래로만 허용합니다.

```text
app -> widgets -> features -> entities -> shared
```

예를 들어 `entities`는 `features`를 import하면 안 됩니다. 라우팅은 `src/app`에 두고, 비즈니스 로직은 FSD slice 안에 둡니다.

## 경로 alias

`tsconfig.alias.json`에서 다음 alias를 관리합니다.

| Alias | Target |
| --- | --- |
| `@app/*` | `src/app/*` |
| `@app-layer/*` | `src/app-layer/*` |
| `@widgets/*` | `src/widgets/*` |
| `@features/*` | `src/features/*` |
| `@entities/*` | `src/entities/*` |
| `@shared/*` | `src/shared/*` |
| `@src/*` | `src/*` |
| `@/*` | `src/*` |

새 import는 상대 경로가 깊어지는 경우 alias를 우선 사용합니다.

## 이미지와 API 연동

Next.js image remote pattern은 `next.config.js`에서 관리합니다.

기본 허용 대상:

- 로컬 API 서버: `http://localhost:5500`
- 서비스 API 이미지: `api.pyosh.com`
- GitHub 이미지 도메인
- Notion 이미지 도메인
- Naver 이미지 도메인

HTTPS 원격 이미지 호스트 목록은 `src/shared/config/remote-image-hosts.json`에 있습니다. 새 이미지 출처를 추가해야 할 때는 해당 파일과 `next.config.js`의 동작을 함께 확인합니다.

## 코드 컨벤션

- TypeScript strict 모드를 기준으로 작성합니다.
- `any`와 근거 없는 `as` cast는 피합니다.
- 스타일은 Tailwind CSS class를 우선 사용합니다.
- 범용 UI는 `shared/ui`에 둡니다.
- 기능별 컴포넌트는 해당 FSD slice에 colocate합니다.
- `src/app`에는 route와 layout 중심의 Next.js 연결 코드만 둡니다.

## 문제 해결

| 증상 | 확인할 항목 |
| --- | --- |
| API 요청이 실패함 | 서버가 `http://localhost:5500`에서 실행 중인지, `.env.local`의 `NEXT_PUBLIC_API_URL`과 `API_URL`이 맞는지 확인 |
| 이미지가 보이지 않음 | 이미지 host가 `next.config.js` remote pattern이나 `remote-image-hosts.json`에 포함되어 있는지 확인 |
| 타입 에러가 빌드에서만 보임 | `pnpm compile:types`로 타입 검사를 먼저 실행 |
| 프로덕션 실행이 실패함 | `pnpm start` 전에 `pnpm build`를 실행했는지 확인 |
| 환경 변수 변경이 브라우저에 반영되지 않음 | `NEXT_PUBLIC_` 변수는 빌드 시점에 반영되므로 개발 서버나 빌드를 다시 실행 |

## 참고 문서

- [Next.js 14 installation](https://nextjs.org/docs/14/getting-started/installation)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [GitHub README guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

## License

MIT License입니다. 자세한 내용은 [LICENSE](./LICENSE)를 확인하세요.
