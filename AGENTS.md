# Project Rules

> This file defines the coding conventions, tech stack, and Git workflow for this project.
> All AI assistants (Claude Code, GitHub Copilot, Gemini, JetBrains Junie) must follow these rules strictly.
> All Answers in Korean

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