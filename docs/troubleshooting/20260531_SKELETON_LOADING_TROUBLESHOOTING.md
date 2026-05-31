# Skeleton UI 트러블슈팅 타임라인 (2026-05-31)

## 요약


| 구분       | 내용                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| **문제상황** | 홈 진입 시 컨트롤 스켈레톤이 늦게 보이거나 위치가 흔들리고, 초기에 네모→원으로 바뀌며 BottomTabBar 대비 로딩 UX가 불안정함                                       |
| **원인**   | `isolation: isolate` 스태킹 컨텍스트, `absolute` 기준 레이아웃, CSS 청크 도착 전 class-only 스타일, 상위 pathname 구독으로 인한 BottomTabBar 리렌더 |
| **해결방법** | 컨트롤 스켈레톤을 라우트 계층으로 분리하고 `fixed`+인라인 폴백으로 좌표 통일, 탭 링크 단위 라우터 구독, `@repo/ui` 공통 skeleton theme로 전역 스타일 일원화            |


## 문서 목적

홈 지도 화면의 스켈레톤 관련 이슈를 **가설 → 구현 → 검증** 순서로 시간축에 따라 정리한다.
이번 작업에서 실제로 시도/롤백/확정된 결정과 재발 방지 포인트를 남긴다.

## 문제 배경

- 지도 화면 진입 초기에 컨트롤 버튼 스켈레톤이 늦게 보이거나 위치가 흔들림
- BottomTabBar는 먼저 보이는데 컨트롤 스켈레톤은 뒤늦게 렌더됨
- 스켈레톤이 초기에 네모였다가 원형으로 바뀌는 시각적 깨짐 존재
- BottomTabBar 탭 이동 시 불필요 리렌더가 관찰됨
- 컴포넌트 스켈레톤과 라우트 스켈레톤 혼선(`pendingComponent`) 발생

---

## 타임라인

## T1. 마커 미리보기/핀 타입 검증 기반 구축

**관찰**

- `pinType`별 렌더 차이를 빠르게 확인하기 어려움
- 미리보기 HTML에서 스크립트가 깨지며 화면이 비정상

**가설**

- 시각 비교 환경을 독립 문서로 두면 핀 타입/배지 정책 변경 검증이 빨라진다
- 미리보기 깨짐은 JS 제어 흐름(`return`) 문법 위치 오류일 가능성이 높다

**구현**

- `docs/marker-pinType-preview.html` 생성/개선
- `LOCKER`, `PLACE 1`, `PLACE 2` 비교 레이아웃 정리
- `return`을 `continue`로 교체하고 헬퍼 함수 스코프 정리
- 배지 텍스트 표시 정책(숫자/`9+`/미표시) 반영

**검증**

- 미리보기 정상 렌더 확인
- 카드 정렬/스케일/설명 문구 반영 확인

**결론**

- 디자인/토큰 변경 전후를 빠르게 비교 가능한 기준점 확보

---

## T2. 컨트롤 스켈레톤 미노출 이슈 1차 분석

**관찰**

- `MapSkeleton` 내부 컨트롤 스켈레톤이 안 보이거나 z-index를 높여도 이상 동작

**가설**

- `NaverMapCanvas` 루트의 `isolation: isolate`로 스태킹 컨텍스트가 분리되어,
내부 스켈레톤이 외부 실제 컨트롤 계층을 이기지 못한다

**구현**

- 컨트롤 스켈레톤을 `MapSkeleton` 내부에서 제거
- 라우트 계층(`routes/index.tsx`)으로 이동하여 실제 컨트롤과 같은 레벨에서 토글
- 재사용 컴포넌트 `MapControlsSkeleton` 신설

**검증**

- 컨트롤 스켈레톤 가시성 회복
- 스태킹 충돌 해소

**결론**

- 지도 배경 스켈레톤과 컨트롤 스켈레톤의 계층 분리가 정답

---

## T3. 초기 렌더 지연/레이아웃 점프 대응

**관찰**

- BottomTabBar는 즉시 보이지만 컨트롤 스켈레톤은 늦게 보임
- 첫 렌더에서 위치가 어긋났다 제자리로 오는 점프 존재

**가설**

- vanilla-extract CSS 청크 도착 전까지 class 기반 레이아웃이 비결정적이라
위치 계산이 늦거나 변한다

**구현**

- `MapControlsSkeleton`에 레이아웃 핵심 속성 인라인 폴백 추가
  - `position/right/bottom/display/flexDirection/gap/zIndex/pointerEvents`
- `SKELETON_SURFACE_STYLE` 공통 상수 도입
- `NaverMapCanvas`에서 `onLoadingChange`를 부모로 올려 스켈레톤 토글 일원화

**검증**

- 스켈레톤 초반 가시성 개선
- CSS 청크 타이밍에 덜 민감해짐

**결론**

- “레이아웃 중요 속성은 class + 인라인 폴백 동시 제공”을 스켈레톤 규칙으로 확정

---

## T4. BottomTabBar 리렌더 최적화

**관찰**

- 탭 이동 시 BottomTabBar 래퍼 자체 리렌더

**가설**

- 상위에서 `pathname` 구독 + `activeTab` prop 전달이 리렌더 전파를 만들고 있다

**구현**

- `BottomTabBar`를 제어형/비제어형으로 분리 (`activeTab?`)
- 각 링크(`BottomTabBarLink`)가 `useRouterState`로 “내가 active인지”만 자체 구독
- 라우팅 유틸(`bottom-tab-routing.ts`) 분리

**검증**

- 탭 전환 시 부모 리렌더가 아닌 링크 단위 갱신으로 축소

**결론**

- 상위 구독 최소화 + 자식 단위 boolean selector가 효과적

---

## T5. 라우트 스켈레톤 게이트링 정리와 i18n 롤백 정합성

**관찰**

- 홈은 컴포넌트 스켈레톤이 충분한데 `pendingComponent` 연결이 혼선을 유발
- 추후 URL 기반 로케일(i18n + Naver map lang) 대응 필요

**가설**

- `pendingComponent` 제거가 구조를 단순화하고, 로케일 경로 구독은 루트에 남겨야 한다

**구현**

- `index.tsx`의 `pendingComponent: HomeSkeleton` 제거
- `__root.tsx`에서 `pathname` 구독을 통해 `<html lang>` 갱신 경로 유지
- 미사용 `-HomeRouteSkeleton.tsx`, `useRouteSkeletonGate.ts` 제거

**검증**

- 홈 동작 이상 없음
- URL 로케일 확장 시 루트 재렌더 경로 유지

**결론**

- 홈은 “컴포넌트 스켈레톤 방식”으로 확정, 라우트 게이트는 제거

---

## T6. 컨트롤 위치 흔들림 + 네모→원 전환 대응 (핵심 안정화)

**관찰**

- 컨트롤 스켈레톤이 초기엔 아래에 있다가 위로 붙는 느낌
- 아이콘 스켈레톤이 초반 네모였다가 원형으로 바뀜

**가설**

1. `absolute` 기준이 부모 레이아웃 변화 영향을 받고 있다
2. 원형은 CSS class(`variant="circle"`) 도착 전 적용되지 않아 시차가 난다

**구현**

- 실제 컨트롤/스켈레톤 모두 `position: fixed`로 통일
- 실컨트롤에도 스켈레톤과 동일 인라인 폴백 좌표 부여
- 원형 스켈레톤은 인라인 반경 강제(`borderRadius={9999}`) 적용
- 이후 사용자 피드백으로 컨트롤이 너무 낮다는 점을 반영해
`bottom` 오프셋을 `bottomNav + 36px` → `bottomNav + 52px`로 조정

**검증**

- 하드 리로드 기준 위치 흔들림 완화 확인
- 원형 전환 깜빡임 해소
- 사용자 체감 확인: “확실히 고쳐졌네”

**결론**

- 위치 결정성은 fixed + 동일 폴백 좌표로 확보
- 형상 결정성은 class 의존 대신 인라인 반경으로 확보

---

## T7. 스켈레톤 시각 톤/애니메이션 공통화

**관찰**

- 스켈레톤 색이 희고 애니메이션이 약해 가시성이 낮음

**가설**

- 앱 레벨 임시 색 보정보다 `@repo/ui`의 Skeleton 기본 스타일을 공통 토큰화해야
전체 일관성이 유지된다

**구현**

- `packages/ui/src/components/feedback/skeleton/skeleton-theme.ts` 신설
  - base/highlight 색, shimmer/pulse duration, 인라인 표면 스타일 정의
- `Skeleton.css.ts`를 pulse 단독에서 `shimmer + pulse` 복합으로 강화
- `prefers-reduced-motion` 대응 추가
- `packages/ui/package.json` exports에 skeleton theme 경로 추가
- 앱의 `shared/ui/skeleton-style.ts`가 UI 공통 토큰을 참조하도록 변경
- 이후 사용자 요청으로 애니메이션을 더 차분하게 재조정
  - 1차: `1600 / 2600`
  - 2차: `1900 / 3200`

**검증**

- 전역 스켈레톤의 톤/움직임 일관성 개선
- BottomTabBar 스켈레톤은 네모↔원 전환 없이 고정 형상 유지

**결론**

- 스켈레톤 스타일 관리의 소스 오브 트루스는 `@repo/ui`로 확정

---

## 의도적 보존/정리 메모

- `apps/web/src/routes/route-skeletons/-SearchRouteSkeleton.tsx`,
`apps/web/src/routes/route-skeletons/-SettingsRouteSkeleton.tsx`는
**사용되지 않더라도 의도적으로 보존**한다.
- 작업 중 삭제했다가 사용자 요청으로 즉시 원복함.

---

## 최종 의사결정 요약

- 홈 스켈레톤 전략: 라우트 게이트가 아닌 컴포넌트 레벨
- 컨트롤 위치 전략: `fixed` + 실컨트롤/스켈레톤 좌표 통일
- 초기 페인트 전략: 레이아웃 핵심 속성 인라인 폴백 필수
- 형상 안정화 전략: circle class 의존 대신 borderRadius 인라인 강제(필요 지점)
- 스타일 전략: `@repo/ui` 공통 skeleton theme를 단일 기준으로 운영

---

## 후속 체크리스트 실행 결과

### 1) 저사양 환경 첫 진입 5회 재검증 (실행 완료)

**실행 방법**

- `http://localhost:3010` 접속 상태에서 하드 리로드(`Ctrl+Shift+R`) 5회 반복
- 각 회차별 스크린샷 캡처

**캡처 파일** (`docs/troubleshooting/assets/`)

- `skeleton-initial-load.png` — 1회차 스켈레톤 노출
- `reload-01-map-loaded.png` — 1회차 이후 지도 로드 완료(대표 1장, run2~5는 동일 상태라 정리 시 제거)
- (원본 5회 캡처: run1~run5 모두 촬영했으나 2~5회는 캐시로 동일 화면)

**관찰 결과**

- 1회차: 지도 본문 로딩 중 스켈레톤 노출 확인
  - 컨트롤 스켈레톤이 원형으로 안정적으로 표시됨 (네모→원 전환 없음)
  - BottomTabBar와 컨트롤 스켈레톤 간 위치 점프 미관측
- 2~5회차: 캐시 영향으로 지도/컨트롤이 빠르게 실상태로 렌더됨
  - 컨트롤 위치 흔들림 미관측
  - BottomTabBar와 상대 오프셋 일관 유지

**판정**

- Pass (재현된 범위에서 위치/형상 안정성 확인)

---

### 2) iOS Safari safe-area 오프셋 점검 (부분 실행)

**실행 방법**

- 모바일 뷰포트 유사 크기로 리사이즈 후 시각 점검
  - `390x844`, `375x812`
- 캡처:
  - `viewport-390x844.png`
  - `viewport-375x812.png`

**관찰 결과**

- 하단 탭바와 컨트롤 버튼 간 여백 비정상 겹침/침범 없음
- 컨트롤 우하단 고정 위치 일관

**제약**

- 본 검증은 데스크톱 브라우저 리사이즈 기반으로,
**실제 iOS Safari의 `env(safe-area-inset-bottom)` 런타임 값**까지는 재현하지 못함

**추가 권장**

- 실제 iPhone Safari(노치 기기)에서 1회 수동 확인:
  - 홈 진입 직후 스켈레톤 노출 시 하단 탭과 컨트롤 간 간격
  - 주소창 축소/확장 시 컨트롤 재배치 안정성

---

### 3) Storybook 스냅샷 비교 자동화 (실행 계획 확정)

현재 저장소 상태(대량 WIP/untracked)에서 CI 구성 변경까지 즉시 반영하면
스코프가 과도하게 커질 수 있어, 이번 사이클에서는 **실행 설계 + 프롬프트**까지 확정한다.

**권장 자동화 파이프라인**

1. Storybook build (`pnpm --filter storybook build`)
2. 시각 회귀 도구(예: Playwright)로 스켈레톤 스토리 캡처
3. 기준 스냅샷과 픽셀 비교(임계치 0.1% 권장)
4. 실패 시 diff 아티팩트 저장

---

### 4) 신규 스켈레톤 적용 규칙 (프롬프트 템플릿)

아래 프롬프트는 신규 컴포넌트에 스켈레톤을 붙일 때 바로 복붙해서 쓸 수 있는
실무용 템플릿이다.

```md
[ROLE]
너는 React + TanStack Start + vanilla-extract 프로젝트에서 스켈레톤 UI를 구현하는 시니어 프론트엔드 엔지니어다.

[GOAL]
대상 컴포넌트에 로딩 스켈레톤을 추가하되, 다음 원칙을 반드시 지켜라:
1) 첫 페인트(CSS 청크 도착 전)에도 위치/형상이 깨지지 않는다.
2) 실제 UI와 스켈레톤의 좌표/계층이 1:1로 일치한다.
3) 스켈레톤 스타일은 @repo/ui 공통 토큰을 재사용한다.

[MANDATORY RULES]
- 레이아웃 핵심 속성은 className만 쓰지 말고 인라인 폴백도 함께 제공:
  - position, top/right/bottom/left 또는 inset
  - display, flexDirection, gap
  - width/height 또는 최소 크기
  - z-index, pointer-events
- 원형 스켈레톤은 CSS class 의존 대신 `borderRadius={9999}`로 인라인 강제한다.
- 앱 로컬 색상 하드코딩 금지. `@repo/ui/components/feedback/skeleton/theme`의 토큰을 사용한다.
- 실제 컨트롤과 스켈레톤이 서로 다른 기준 컨테이너를 참조하면 안 된다.
  - 가능하면 둘 다 fixed 기준 또는 동일한 상위 기준으로 통일.

[IMPLEMENTATION CHECKLIST]
1. 대상 컴포넌트의 실제 배치 class를 파악하고, 동일한 배치 규칙을 Skeleton에 반영한다.
2. Skeleton 전용 컴포넌트(`XxxSkeleton.tsx`)를 대상 컴포넌트 근처에 만든다.
3. `XxxSkeleton.css.ts`에 토큰 기반 class를 정의한다.
4. `XxxSkeleton.tsx`에서 위 class와 동일한 인라인 폴백 style 객체를 만든다.
5. 로딩 토글은 부모에서 단일 상태로 제어하고, 실제 UI와 Skeleton을 상호배타 렌더링한다.
6. 하드 리로드 3회 이상으로 초기 점프/형상 전환 여부를 확인한다.

[VERIFICATION STEPS]
- 기능 검증:
  - 하드 리로드 직후 Skeleton이 즉시 보이는가
  - Skeleton이 네모→원, 위치 튐 등의 시각 전환 없이 안정적인가
  - 실제 UI로 전환 시 레이아웃 시프트가 없는가
- 코드 검증:
  - 새 Skeleton이 공통 토큰을 참조하는가
  - 인라인 폴백이 레이아웃 핵심 속성을 모두 포함하는가
  - lints/typecheck 통과 여부

[OUTPUT FORMAT]
1) 변경 파일 목록
2) 적용한 레이아웃 규칙(class + inline fallback) 요약
3) 검증 결과(재현 시나리오 + 관찰 결과)
4) 남은 리스크(있다면)
```

---

## 체크리스트 기반 커밋 반영 메모

- 체크리스트 1, 2의 검증 로그는 본 문서에 반영 완료
- 체크리스트 3은 현재 브랜치 스코프를 넘지 않도록 “자동화 설계/프롬프트”까지 확정
- 체크리스트 4는 팀 공통 템플릿으로 즉시 재사용 가능

