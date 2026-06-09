# Post-MVP: 검색 공유·라우팅 백로그

MVP 이후 논의·적용 예정 항목입니다. (2026-06-09 기준)

## 3. 딥링크 `/?locker={id}`

### 목표

외부/앱 내 링크로 특정 보관함 상세를 바로 연다.

### 현재 상태

- 홈(`index.tsx`)은 검색·지도·바텀시트 상태를 **컴포넌트 state**로만 관리
- URL search params에 `locker` 키 처리 없음
- 상세 진입은 지도 핀·검색 리스트 선택 후 `openLockerDetailById` 경로

### 구현 시 고려사항

| 항목 | 내용 |
|------|------|
| 라우트 | TanStack Router `validateSearch`에 `locker?: number` 추가 |
| 초기화 | 마운트 시 `locker` 있으면 `useLockerDetail` 호출 + 바텀시트 `detail` 모드 |
| 지도 | 상세 좌표로 `panTo` / bounds fit |
| 에러 | 없는 ID·API 실패 시 토스트 + 홈 기본 상태 |
| 공유 | 상세 공유 버튼이 이 URL 생성 (`?locker=` 형태) |

### 범위 밖 (MVP)

- 푸시 알림·카카오 공유 등 외부 채널 연동
- 로그인 사용자 북마크 동기화

### 수용 기준 (초안)

- [ ] `/?locker=123` 접속 시 해당 보관함 상세 시트 표시
- [ ] 잘못된 ID는 빈 상세 없이 안내 후 홈 유지
- [ ] 뒤로가기 시 URL에서 `locker` 제거

---

## 4. SEO `/lockers/:id`

### 목표

검색 엔진·SNS OG용 보관함 상세 전용 URL.

### 현재 상태

- SPA 단일 홈 라우트 중심
- 메타/OG는 앱 공통 설정 수준
- 보관함별 title/description/canonical 없음

### 구현 시 고려사항

| 항목 | 내용 |
|------|------|
| 라우트 | `/lockers/$lockerId` (또는 팀 합의 path) |
| 데이터 | SSR/프리렌더 또는 edge에서 `GET /api/v1/lockers/{id}` 메타 주입 |
| OG | `og:title`, `og:description`, 좌표·주소 요약 |
| 앱 연동 | 모바일 웹 → 기존 홈 상세 UI 재사용 vs 전용 페이지 |
| 3번과 관계 | 딥링크는 쿼리, SEO는 path — 리다이렉트 정책 합의 필요 |

### MVP에서 미루는 이유

- 데모·심사는 in-app 검색→상세 흐름으로 충분
- SEO는 트래픽·마케팅 단계 과제
- SSR 인프라 없으면 크롤러 효과 제한적

### 수용 기준 (초안)

- [ ] `/lockers/{id}` URL이 고유 title/description을 가짐
- [ ] SNS 공유 시 미리보기에 보관함명·주소 노출
- [ ] 앱 내에서도 동일 URL로 상세 진입 가능 (또는 3번과 redirect 통일)

---

## 논의 시 체크리스트

1. **3번만** 먼저 할지, **4번과 URL 체계를 한 번에** 잡을지
2. 공유 URL canonical: `?locker=` vs `/lockers/:id` 우선순위
3. Vercel/배포에서 SSR·prerender 범위 (전체 vs 상세만)
4. 다국어 OG 문구 (paraglide 연동)

## 관련 코드 (참고)

- 홈 오케스트레이션: `apps/web/src/routes/index.tsx`
- 상세 API: `useLockerDetail`, `getLockerDetail`
- 공유 UI: `LockerDetailBottomSheet` / `NavigationPlatformPopup`
