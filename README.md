# Our Journey

TanStack Start 기반의 React 애플리케이션 프로젝트입니다.

---

## 📦 프로젝트 시작 방법

### 요구사항
- **Node.js 24+** (필수)
- **pnpm** (패키지 매니저)

### 환경 설정

#### 1. Node.js 설치 (nvm 사용 권장)

```bash
# nvm이 설치되어 있지 않다면
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js 24 설치 및 활성화
nvm install 24
nvm use 24

# 설치 확인
node --version  # v24.x.x 확인
```

#### 2. pnpm 설치

```bash
# corepack 사용 (권장)
corepack enable
corepack prepare pnpm@latest --activate

# 또는 npm으로 설치
npm install -g pnpm

# 설치 확인
pnpm --version  # 10.x.x 이상 확인
```

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd Zimdugo-4th-Client

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 실행 (http://localhost:3010)
pnpm dev
```

### 주요 명령어

```bash
# 개발
pnpm dev              # 개발 서버 실행 (http://localhost:3010)
pnpm build            # 프로덕션 빌드
pnpm preview          # 프로덕션 빌드 미리보기

# 코드 품질
pnpm format           # 코드 포맷팅 (Biome)
pnpm lint             # 린트 검사 (Biome)
pnpm check            # 포맷 + 린트 검사

# 테스트
pnpm test             # 테스트 실행 (Vitest)

# Storybook
pnpm storybook        # Storybook 실행 (http://localhost:6006)
pnpm build-storybook  # Storybook 빌드
```

---

## 🛠 기술 스택

| 카테고리 | 라이브러리 / 도구 |
|---|---|
| **언어** | TypeScript |
| **UI** | React 19 |
| **프레임워크** | TanStack Start |
| **서버 상태 관리** | TanStack Query |
| **클라이언트 상태 관리** | Zustand |
| **HTTP 클라이언트** | axios |
| **폼 관리** | React Hook Form |
| **유효성 검증** | Zod |
| **스타일링** | vanilla-extract (CSS-in-TS) |
| **애니메이션** | motion |
| **인증** | better-auth |
| **패키지 매니저** | pnpm |
| **린터 / 포매터** | Biome |
| **컴포넌트 개발** | Storybook |
| **날짜 처리** | dayjs |
| **유틸리티** | es-toolkit |
| **런타임** | Node.js 24 |
| **배포** | Vercel |

---

## 📁 프로젝트 구조

본 프로젝트는 **pnpm workspace 기반 모노레포** 구조를 채택하고 있으며, **Feature-Sliced Design (FSD)** 철학을 따릅니다.

```
our-journey/
├── apps/
│   ├── web/              # 메인 웹 애플리케이션
│   │   ├── public/       # 정적 파일
│   │   ├── src/
│   │   │   ├── app/      # 앱 레벨 설정 및 전역 스타일
│   │   │   ├── composites/   # 복합 컴포넌트
│   │   │   ├── entities/     # 비즈니스 엔티티
│   │   │   ├── features/     # 기능 단위 모듈
│   │   │   ├── routes/       # 라우트 정의
│   │   │   ├── shared/       # 공유 리소스
│   │   │   ├── router.tsx
│   │   │   └── routeTree.gen.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── storybook/        # Storybook 앱
│       ├── .storybook/   # Storybook 설정
│       └── package.json
├── packages/
│   ├── ui/               # 공통 UI 컴포넌트
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── configs/          # 공유 설정 (tsconfig, biome 등)
│   │   ├── tsconfig.json
│   │   ├── biome.json
│   │   └── package.json
│   └── libs/             # 공통 라이브러리 설정
│       ├── src/
│       │   ├── axios.ts
│       │   ├── auth.ts
│       │   ├── auth-client.ts
│       │   └── es-toolkit.ts
│       ├── tsconfig.json
│       └── package.json
├── .agents/              # AI 에이전트 설정
├── .aiassistant/         # AI 어시스턴트 설정
├── .claude/              # Claude Code 설정
├── .github/              # GitHub Actions 워크플로우
├── .junie/               # JetBrains Junie 설정
├── .vscode/              # VS Code 설정
├── pnpm-workspace.yaml   # pnpm 워크스페이스 설정
└── package.json          # 루트 package.json
```

### 워크스페이스 구조

#### 📂 `apps/web/`
메인 웹 애플리케이션으로, **Feature-Sliced Design (FSD)** 구조를 따릅니다.

- **`src/app/`**: 앱 레벨 설정 (전역 스타일, Provider 등)
- **`src/shared/`**: 공유 리소스 (utils, hooks, ui, types)
- **`src/entities/`**: 비즈니스 엔티티 (도메인 중심)
- **`src/features/`**: 기능 단위 모듈 (사용자 상호작용)
- **`src/composites/`**: 복합 컴포넌트 (여러 entities/features 조합)
- **`src/routes/`**: TanStack Router 라우트 정의

#### 📂 `apps/storybook/`
컴포넌트 개발을 위한 Storybook 앱입니다.
- `packages/ui`와 `apps/web`의 컴포넌트 스토리를 참조합니다.

#### 📂 `packages/ui/`
여러 앱에서 공유하는 공통 UI 컴포넌트 라이브러리입니다.
- 디자인 시스템의 기본 컴포넌트 (Button, Input 등)를 포함합니다.

#### 📂 `packages/configs/`
프로젝트 전반에서 사용하는 공유 설정 파일들입니다.
- `tsconfig.json`: TypeScript 기본 설정
- `biome.json`: Biome 린터/포매터 설정

#### 📂 `packages/libs/`
여러 앱에서 공유하는 라이브러리 설정 및 re-export 패키지입니다.
- `axios`: HTTP 클라이언트 설정 및 API 메서드
- `better-auth`: 인증 설정 (서버/클라이언트)
- `es-toolkit`: 유틸리티 함수 라이브러리 (lodash 대체)

### 레이어 의존성 규칙

#### apps/web 내부 (FSD 구조)
```
(상위) routes → composites → features → entities → shared (하위)
```

- **상위 레이어**는 하위 레이어를 import 가능
- **하위 레이어**는 상위 레이어를 import 불가
- **`shared`**는 모든 레이어에서 사용 가능
- **동일 레이어 내** 크로스 import 금지 (`entities/user` ↔ `entities/product` ❌)

#### 워크스페이스 간 의존성
```
apps/web → packages/ui, packages/libs
apps/storybook → packages/ui
packages/ui → (외부 의존성만)
packages/libs → (외부 의존성만)
packages/configs → (외부 의존성만)
```

### 패키지 사용 예시

#### `@repo/libs` 사용법
```typescript
// axios 사용
import { apiClient, httpGet, httpPost } from '@repo/libs/axios'

// better-auth 사용 (서버)
import { auth } from '@repo/libs/auth'

// better-auth 사용 (클라이언트)
import { authClient } from '@repo/libs/auth-client'

// es-toolkit 사용
import { debounce, throttle } from '@repo/libs/es-toolkit'
```

---

## 📄 AI 관련 문서 설명

본 프로젝트는 AI 코딩 어시스턴트와의 협업을 위한 규칙과 스킬을 명확히 정의하고 있습니다.

### 문서 구조

```
.
├── AGENTS.md              # 원본 규칙 문서 (마스터)
├── CLAUDE.md -> AGENTS.md # 심볼릭 링크 (Claude Code용)
├── .agents/               # AI 에이전트 설정 디렉토리
│   └── skills/            # AI 스킬 모음
│       ├── vercel-react-best-practices/
└       └── web-design-guidelines/
```

### `AGENTS.md` (원본 문서)
- **목적**: 프로젝트의 코딩 컨벤션, 기술 스택, Git 워크플로우를 정의하는 **마스터 문서**
- **주요 내용**:
  - 코드 컨벤션
  - 타입 정의
  - 컴포넌트 구조
  - Git 컨벤션
- **대상**: Claude Code, GitHub Copilot, Gemini, JetBrains Junie 등 모든 AI 어시스턴트

### 심볼릭 링크
다양한 AI 도구가 동일한 규칙을 참조하도록 심볼릭 링크를 사용합니다.

- **`CLAUDE.md`** → `AGENTS.md`
  - Claude Code가 참조하는 프로젝트 규칙 파일
  - 원본(`AGENTS.md`)과 항상 동기화됨

향후 다른 AI 도구를 위한 심볼릭 링크 추가 가능:
- `guideline.md` → `AGENTS.md` (범용)
- `copilot-instructions.md` → `AGENTS.md` (GitHub Copilot)

### AI 스킬 (`.agents/skills/`)

프로젝트에는 Vercel에서 제공하는 2개의 AI 스킬이 설치되어 있습니다.

#### `vercel-react-best-practices`
- **출처**: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **목적**: React 및 Next.js 성능 최적화 가이드라인

#### `web-design-guidelines`
- **출처**: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **목적**: 웹 인터페이스 디자인 가이드라인 준수 검증

### 기타 AI 설정 폴더
- **`.claude/`**: Claude Code 전용 설정
- **`.aiassistant/`**: AI 어시스턴트 범용 설정
- **`.junie/`**: JetBrains Junie 전용 설정
- **`.agents/`**: AI 에이전트 및 스킬 저장소

---


## 📚 참고 자료

- [TanStack Start 공식 문서](https://tanstack.com/start)
- [TanStack Query 공식 문서](https://tanstack.com/query)
- [TanStack Router 공식 문서](https://tanstack.com/router)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [React 19 공식 문서](https://react.dev/)

