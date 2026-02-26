# Our Journey

TanStack Start 기반의 React 애플리케이션 프로젝트입니다.

---

## 📦 프로젝트 시작 방법

### 요구사항
- Node.js 24+
- pnpm (패키지 매니저)

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3010)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 미리보기
pnpm preview

# 코드 포맷팅
pnpm format

# 린트 검사
pnpm lint

# 코드 검사 (포맷 + 린트)
pnpm check

# 테스트 실행
pnpm test

# Storybook 실행 (http://localhost:6006)
pnpm storybook

# Storybook 빌드
pnpm build-storybook
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

본 프로젝트는 **Feature-Sliced Design (FSD)** 철학을 따르는 계층형 아키텍처를 채택하고 있습니다.

```
our-journey/
├── .agents/          # AI 에이전트 설정
├── .aiassistant/     # AI 어시스턴트 설정
├── .claude/          # Claude Code 설정
├── .github/          # GitHub Actions 워크플로우
├── .junie/           # JetBrains Junie 설정
├── .output/          # 빌드 출력 디렉토리
├── .storybook/       # Storybook 설정
├── .tanstack/        # TanStack 생성 파일
├── .vscode/          # VS Code 설정
├── public/           # 정적 파일
└── src/
    ├── app/          # 앱 레벨 설정 및 전역 스타일
    ├── composites/   # 복합 컴포넌트 (여러 entities/features 조합)
    ├── entities/     # 비즈니스 엔티티 (도메인 중심)
    ├── features/     # 기능 단위 모듈 (사용자 상호작용)
    ├── routes/       # 라우트 정의
    ├── shared/       # 공유 리소스 (utils, hooks, ui, types 등)
    ├── router.tsx    # 라우터 설정
    └── routeTree.gen.ts  # TanStack Router 생성 파일
```

### 폴더별 상세 설명

#### 📂 `src/app/`
- **역할**: 애플리케이션 레벨의 설정 및 초기화
- **포함 내용**:
  - 전역 스타일 (`styles/global.css.ts`)
  - Provider 설정
  - 전역 레이아웃
- **예시**: 테마 설정, 전역 CSS, 에러 바운더리

---

#### 📂 `src/shared/`
- **역할**: 프로젝트 전반에서 재사용 가능한 공유 리소스
- **하위 구조**:
  ```
  shared/
  ├── constants/    # 상수 정의 (API URL, 설정값 등)
  ├── hooks/        # 공용 커스텀 훅
  ├── lib/          # 외부 라이브러리 래퍼 및 유틸리티
  ├── types/        # 공용 타입 정의
  └── ui/           # 공용 UI 컴포넌트 (Button, Input 등)
  ```
- **특징**:
  - 비즈니스 로직에 독립적
  - 다른 레이어에 의존하지 않음
  - 어디서든 import 가능
- **예시**:
  - `shared/ui/Button.tsx` - 범용 버튼 컴포넌트
  - `shared/hooks/useMediaQuery.ts` - 반응형 훅
  - `shared/lib/api-client.ts` - axios 클라이언트 설정
  - `shared/types/common.ts` - 공통 타입 정의

---

#### 📂 `src/entities/`
- **역할**: 비즈니스 엔티티 중심의 데이터 및 UI 관리
- **하위 구조** (예: `entities/user/`):
  ```
  user/
  ├── api/       # 사용자 관련 API 호출 함수
  ├── data/      # 사용자 데이터 스키마, 타입 정의
  ├── helper/    # 사용자 데이터 가공 헬퍼 함수
  ├── hooks/     # 사용자 관련 커스텀 훅 (useUser 등)
  └── ui/        # 사용자 관련 UI 컴포넌트 (UserCard, UserAvatar 등)
  ```
- **특징**:
  - 도메인 엔티티별로 폴더 구성 (user, product, order 등)
  - 데이터 중심 (CRUD, 상태 관리)
  - 비즈니스 로직 포함하지 않음
- **예시**:
  - `entities/user/api/getUser.ts` - 사용자 조회 API
  - `entities/user/hooks/useUserQuery.ts` - TanStack Query 훅
  - `entities/user/ui/UserProfile.tsx` - 사용자 프로필 컴포넌트

---

#### 📂 `src/features/`
- **역할**: 사용자 상호작용 기능 단위 모듈
- **하위 구조** (예: `features/auth/sign-in/`):
  ```
  auth/
  └── sign-in/
      ├── api/       # 로그인 API 호출
      ├── data/      # 로그인 폼 스키마 (Zod)
      ├── helper/    # 로그인 관련 유틸 함수
      ├── hooks/     # 로그인 관련 훅
      └── ui/        # 로그인 폼 컴포넌트
  ```
- **특징**:
  - 사용자 액션 중심 (로그인, 장바구니 추가, 게시글 작성 등)
  - `entities` 레이어의 데이터를 조합하여 사용
  - 비즈니스 로직 포함
- **예시**:
  - `features/auth/sign-in/ui/SignInForm.tsx` - 로그인 폼
  - `features/auth/sign-in/data/schema.ts` - Zod 유효성 검증 스키마
  - `features/auth/sign-in/hooks/useSignIn.ts` - 로그인 처리 훅

---

#### 📂 `src/composites/`
- **역할**: 여러 `entities`와 `features`를 조합한 복합 컴포넌트
- **하위 구조** (예: `composites/header/`):
  ```
  header/
  └── ui/
      └── Header.tsx
  ```
- **특징**:
  - 페이지 레벨보다 작은 단위의 조합
  - 여러 도메인을 가로지르는 컴포넌트
  - 레이아웃, 헤더, 사이드바 등
- **예시**:
  - `composites/header/ui/Header.tsx` - 네비게이션 + 사용자 메뉴 조합
  - `composites/sidebar/ui/Sidebar.tsx` - 사이드바 네비게이션

---

#### 📂 `src/routes/`
- **역할**: TanStack Router 라우트 정의
- **주요 파일**:
  - `__root.tsx` - 루트 레이아웃
  - `index.tsx` - 홈페이지 (`/`)
  - 각 페이지별 라우트 파일
- **특징**:
  - 파일 기반 라우팅
  - 레이아웃 및 데이터 로딩 정의
- **예시**:
  - `routes/__root.tsx` - 전체 레이아웃 및 Provider 설정
  - `routes/index.tsx` - 메인 페이지

---

### 레이어 의존성 규칙

```
(상위) routes → composites → features → entities → shared (하위)
```

- **상위 레이어**는 하위 레이어를 import 가능
- **하위 레이어**는 상위 레이어를 import 불가
- **`shared`**는 모든 레이어에서 사용 가능
- **동일 레이어 내** 크로스 import 금지 (`entities/user` ↔ `entities/product` ❌)

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

