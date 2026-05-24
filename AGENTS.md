# Project Rules

> This file defines the coding conventions, tech stack, and Git workflow for this project.
> All AI assistants (Claude Code, GitHub Copilot, Gemini, JetBrains Junie) must follow these rules strictly.
> All Answers in Korean

---

## AI Development Workflow

> This section is shared by Codex, Claude Code, Cursor, Gemini CLI, Antigravity, and other AI coding agents.
> Agent-specific files should point back here instead of redefining conflicting rules.
> `CLAUDE.md` is a symlink to this file. Keep agent-specific adapters thin; put shared rules here.

### Source of Truth

- Read this `AGENTS.md` before changing code.
- Answer in Korean.
- Keep changes small enough to review, explain, revert, and commit independently.
- Preserve unrelated user or agent changes. Do not reset or revert files unless explicitly asked.
- Treat `pnpm-lock.yaml` as dependency evidence. Do not change it unless a real dependency change requires it.

### Standard Review Graph

Use this graph before staging or committing:

1. Scope review: list changed files and decide the smallest commit boundary.
   - When `code-review-graph` is available: run `detect_changes` (MCP) or `code-review-graph detect-changes --base main` (CLI) to catch scope bleed (e.g. `packages/ui`-only PR vs unstaged `apps/web` changes).
2. Dependency/import review: verify moved files, package exports, import paths, and lockfile impact.
   - For shared package or export changes: `get_impact_radius` or `get_review_context` on touched entry files.
3. Type/lint review: run the narrowest useful TypeScript, Biome, or package check.
4. UI review: for Storybook/Figma/UI changes, verify the rendered story or equivalent browser path.
5. Code review: use gstack `/review` when available. Otherwise perform a bug-first review manually.
6. Security review: use gstack `/cso` for auth, dependency, env, infra, CI/CD, external API, file upload, location, or user-data changes.
7. Context checkpoint: save the current decisions and remaining work when the task spans multiple sessions.
8. Commit review: ensure the staged files match one coherent Korean commit message.

### code-review-graph

MCP is configured per agent via `code-review-graph install --platform all --no-instructions`. Rules live here only — do not duplicate in agent-specific files.

| Step | MCP tool | CLI fallback |
|------|----------|--------------|
| Scope / PR boundary | `detect_changes` | `code-review-graph detect-changes --base main` |
| Import blast radius | `get_impact_radius`, `get_review_context` | — |
| Structure search | `query_graph`, `semantic_search_nodes` | Grep/Read when graph lacks coverage |

Setup: `code-review-graph build` (once), `code-review-graph update` (incremental). Data dir: `.code-review-graph/` (gitignored).

After clone, each machine runs: `code-review-graph install --platform all --no-instructions -y`

| Agent | MCP config |
|-------|------------|
| Cursor | `.cursor/mcp.json` |
| Codex | `~/.codex/config.toml` |
| Claude Code | `.mcp.json` |
| Gemini CLI | `.gemini/settings.json` |
| Antigravity | `~/.gemini/antigravity/mcp_config.json` |

CRG supplements gstack `/review`; it does not replace manual or gstack review.

### gstack Usage

When gstack is available, prefer these skills:

- Planning: `/office-hours`, `/autoplan`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`
- Code review: `/review`
- Security review: `/cso`
- UI and browser QA: `/design-review`, `/qa`, `/qa-only`, `/browse`
- Context: `/context-save`, `/context-restore`
- Safety: `/guard`, `/freeze`, `/careful`, `/unfreeze`
- Shipping: `/ship`, `/land-and-deploy`, `/canary`

If gstack is not available in the current agent, follow the same review graph manually and record any skipped checks.

### RTK Usage

When RTK is available, use it for noisy shell output so the agent can keep more useful context:

- `rtk git status`
- `rtk git diff`
- `rtk grep "pattern" .`
- `rtk tsc`
- `rtk lint biome`
- `rtk test <command>`
- `rtk pnpm list`

Use raw commands when full output is required for debugging or when RTK is unavailable.

### UI Component Workflow

For `packages/ui` component work:

1. Inspect `Button` conventions first.
2. Keep actual component directory ownership separate from Storybook information architecture.
3. Update package exports when moving public components.
4. Update consuming app imports immediately after file moves.
5. Keep Storybook stories consistent with component category and avoid unnecessary explanatory copy.
6. Verify with `pnpm exec tsc -p packages/ui/tsconfig.json --noEmit --pretty false`.

### Context Mode

For long work, maintain a context note under `docs/context/<issue-key>.md` or use gstack `/context-save`.

**Local only — do not commit.** `docs/context/*` is gitignored (only `docs/context/.gitkeep` is tracked). Context notes are for your machine and session continuity, not for the shared repository.

Record:

- Current goal
- Decisions made
- Files intentionally included or excluded from the next commit
- Verification commands already run
- Remaining risks or skipped checks

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Language | TypeScript |
| UI | React 19 |
| Framework | TanStack Start (Full-stack) |
| Server State | TanStack Query |
| Client State | Zustand |
| HTTP Client | axios |
| Form | React Hook Form |
| Validation | Zod |
| Styling | vanilla-extract (CSS-in-TS) |
| Animation | motion |
| Auth | better-auth |
| Package Manager | pnpm |
| Linter / Formatter | Biome |
| Component Dev | Storybook |
| Date | dayjs |
| Utility | es-toolkit |
| Runtime | Node.js 24 |
| Deploy | Vercel |

---

## Code Conventions

### 엔지니어링 품질 게이트

- 오류, 테스트 실패, 예상하지 못한 동작이 발생하면 코드를 수정하기 전에 원인 추적 흐름을 먼저 따른다. 증상, 재현 경로, 최근 변경, 가설, 검증 결과를 함께 확인한다.
- Storybook 또는 Figma 기반 UI 컴포넌트는 렌더링되는 Storybook 스토리나 동등한 브라우저 실행 경로를 확인한다. 린트와 TypeScript 검사는 필요하지만 렌더링 검증을 대체하지 않는다.
- 반복될 가능성이 있는 비단순 문제가 해결되고 검증되면 Compound Engineering의 compound 단계를 실행해 `docs/solutions/`에 학습 내용을 문서화한다.
- 커밋을 스테이징하기 전에 커밋 범위를 검토하고 관련 gstack 피드백 단계를 실행한다. 보안, 의존성, 인증, 인프라, 환경, CI/CD, 데이터 노출과 관련된 변경은 CSO 리뷰를 사용하고, 일반 구현과 UI 변경은 코드 리뷰 또는 디자인 리뷰를 사용한다.
- 각 커밋은 독립적으로 리뷰, 되돌리기, 설명이 가능할 만큼 작게 유지한다.

### Functions

#### Components
- Use `function` declaration (not arrow function)
- Use PascalCase
- Named export preferred; default export only when required

```tsx
// ✅
export function UserProfile({ user }: Props) { ... }
export function LoadingSpinner() { ... }

// ❌
const UserProfile = ({ user }: Props) => { ... }
export default UserProfile
```

#### Utility / Helper
- Use `const` + arrow function
- Use camelCase

```tsx
export const formatDate = (date: Date) => date.toLocaleDateString('ko-KR')
export const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

#### Event Handlers
- Pattern: `const handle{Verb}{Target?} = () => {}`

```tsx
const handleClick = () => { ... }
const handleSubmit = () => { ... }
const handleShareImage = () => { ... }
```

#### Async Data Functions
- Prefix with REST method: `get` / `post` / `put` / `patch` / `delete`

```tsx
const getUser = async (id: string) => { ... }
const postConfig = (config: Config) => { ... }
const putDatabase = async (request: Request) => { ... }
```

---

### Variables

| Kind | Convention | Example |
|---|---|---|
| General | camelCase | `const userName = 'john'` |
| Constant | SCREAMING_SNAKE_CASE | `const API_BASE_URL = '...'` |
| Boolean | prefix: `is` / `has` / `can` | `const isMobile = width < 768` |
| Ref | suffix: `Ref` | `const handlerRef = useRef(handler)` |

- Avoid negated booleans: `isNotMobile` ❌ → `isMobile` ✅

---

### Hooks

- Must start with `use` prefix
- Returns a value → `use` + Noun
- Provides functionality → `use` + Verb/Noun

```tsx
const useLatest = <T>(value: T) => { ... }        // returns value
const useWindowEvent = (event, handler) => { ... } // provides feature
```

---

### File Naming

| Kind | Convention | Example |
|---|---|---|
| Component | PascalCase | `UserProfile.tsx` |
| Hook | camelCase + `use` prefix | `useAuth.ts` |
| Type file | kebab-case | `campaign-types.ts` |
| Util / Lib / Config | kebab-case | `api-client.ts`, `format-date.ts` |

---

### Types & Interfaces

- PascalCase, no `I` prefix (`IUser` ❌ → `User` ✅)
- Props: `{ComponentName}Props` or inline destructuring
- Generic: single uppercase letter (`T`, `K`, `V`)
- Use `export type` when exporting only types

#### interface vs type

| Use | When |
|---|---|
| `interface` | Object shape: domain models, Props, API responses |
| `type` | Union, intersection, utility types, function signatures, aliases |

```tsx
// interface — object shape
interface User {
  id: string
  name: string
  isAdmin: boolean
}

// type — union
type ActivityMode = 'visible' | 'hidden'

// type — function signature
type Fetcher = (key: string) => Promise<unknown>
```

#### No `enum` — use `as const` instead

```tsx
// ❌
enum CampaignStatus { Draft = 'draft', Active = 'active' }

// ✅
const CAMPAIGN_STATUS = {
  Draft: 'draft',
  Active: 'active',
  Closed: 'closed',
} as const

type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS]
```

---

### Component Internal Order

Always follow this order inside a component:

```tsx
function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hook calls (useState, useQuery, useRef, custom hooks...)
  // 2. Derived values (useMemo, computed values)
  // 3. Event handlers (handleClick, handleSubmit...)
  // 4. Side effects (useEffect)
  // 5. Early returns (loading / error states)
  // 6. JSX return
}
```

```tsx
function Example({ userId }: { userId: string }) {
  // 1) Hooks
  const [count, setCount] = useState(0)
  const { data, isLoading } = useQuery({ queryKey: ['user', userId], queryFn: () => getUser(userId) })
  const ref = useRef<HTMLDivElement>(null)

  // 2) Derived values
  const isMobile = useMediaQuery('(max-width: 767px)')
  const sortedItems = useMemo(() => data?.items.toSorted(...), [data])

  // 3) Event handlers
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  // 4) Side effects
  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count])

  // 5) Early returns
  if (isLoading) return <Skeleton />
  if (!data) return <ErrorDisplay />

  // 6) JSX
  return <div ref={ref}>{sortedItems?.map(...)}</div>
}
```

---

## Git Conventions

All Messages should be written in Korean

### Commit Message Format

```
<type>: <title (imperative, ≤50 chars, no period)>

<body (optional)>

<footer (optional)>
```

#### Commit Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactor without behavior change |
| `style` | Formatting, missing semicolons (no logic change) |
| `chore` | Build config, package updates, etc. |
| `docs` | Documentation changes |
| `test` | Add or update tests |
| `perf` | Performance improvement |
| `revert` | Revert previous commit |

#### Examples

```
feat: 캠페인 목록 필터 추가
fix: 모바일 네비게이션 레이아웃 깨짐 수정
chore: TanStack Query v5로 업그레이드
```

```
fix(payment): 가상계좌 결제 완료 후 상태 미갱신 수정

결제 완료 웹훅 수신 후 쿼리 캐시를 invalidate하지 않아
결제 상태가 즉시 반영되지 않는 문제 수정
```

---

### Branch Strategy (Git Flow)

```
main
└── develop
    ├── feat/...
    ├── fix/...
    ├── refactor/...
    └── chore/...
```

#### Branch Types

| Branch | Purpose | Deploy |
|---|---|---|
| `main` | Production. Direct push forbidden | production |
| `develop` | Integration. Direct push forbidden | development |
| `feat/...` | Feature development | - |
| `fix/...` | Bug fix | - |
| `hotfix/...` | Urgent production fix | - |
| `chore/...` | Build config, packages | - |
| `docs/...` | Documentation | - |
| `refactor/...` | Refactoring | - |

#### Branch Naming

```
<type>/<kebab-case-description>

# Examples
feat/campaign-filter
fix/mobile-nav-layout
feat/42-google-social-login   # with issue number
fix/87-pagination-error
```

#### Workflow

- Feature branches → PR → `develop` (squash merge)
- `hotfix/*` → PR → `main`
- Merged branches must be deleted
- PR title follows commit message format
- Minimum 1 reviewer approval required

#### PR Body Template

```
### 변경 사항
<!-- 무엇을 변경했는지 간략히 작성 -->

### 작업 배경
<!-- 왜 이 작업이 필요했는지 작성 -->

### 관련 이슈
<!-- 관련 이슈가 있으면 링크 -->
```
