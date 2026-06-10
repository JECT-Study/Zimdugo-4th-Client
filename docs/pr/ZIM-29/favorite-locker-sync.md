# ZIM-29 검색 컨텍스트 즐겨찾기 — 설계·동기화 메모

PR [#54](https://github.com/JECT-Study/Zimdugo-4th-Client/pull/54) / 브랜치 `ZIM-29` 작업 중 정리한 내용입니다.  
**reconcile(서버 refetch 후 baseline 정합)** 은 의도적으로 보류했습니다.

---

## 1. 아키텍처 요약

즐겨찾기는 **낙관적 UI + 지연 flush** 패턴입니다.

| 레이어 | 역할 |
|--------|------|
| `pending` | 토글 직후 ~ flush 전, 서버 미반영 변경 |
| `baseline` | flush 성공 후 로컬 확정값 (마지막으로 서버에 쓴 상태) |
| 서버 캐시 | React Query GET 응답의 `isFavorite` |

**화면 표시 우선순위**

```
pending → baseline → 서버(캐시) isFavorite
```

관련 코드:

- `apps/web/src/features/search/model/favorite-locker-session.ts`
- `apps/web/src/features/search/hooks/useFavoriteLockerSession.ts`
- `apps/web/src/routes/index.tsx` (overlay, flush 시점)

---

## 2. API(쓰기) 호출 시점 — flush

하트를 누르는 순간에는 **API를 호출하지 않습니다.**  
`flush()`가 실행될 때 `baseline` 대비 diff만 `POST`/`DELETE` 합니다.

| 트리거 | 사용자 동작 |
|--------|-------------|
| `openLockerDetailById` | 리스트에서 **다른 보관함 상세** 진입 |
| `handleBackFromDetail` | 상세에서 **뒤로** |
| `handleBackToKeywordList` | 장소 목록 → **키워드 목록** |
| `resetSearchContext` | 검색 컨텍스트 **종료** |
| `resetMapContext` | 지도 컨텍스트 **초기화** |

**flush 하지 않는 경우:** 같은 화면에서 하트만 여러 번 누르기, 필터 열기, 지도 이동 등.

---

## 3. 목록 → 상세 즐겨찾기가 ☆로 보이던 문제

### 증상

검색 리스트에서 즐겨찾기 추가 후 **바로 상세**에 들어가면 상세가 ☆로 보임.

### 원인 (서버 딜레이만이 아님)

1. 상세 진입 시 `flush` → `baseline = true`, `pending` 비움 (정상)
2. `syncBaselineFromSearchData` / 상세 쿼리가 **stale 캐시**(`isFavorite: false`)로 돌아옴
3. (당시) `seedFavoriteBaseline`이 pending 없을 때 서버 값으로 baseline **재덮어쓰기** → `baseline`이 다시 `false`
4. 표시: `pending` 없음 + `baseline false` → ☆

즉 **프론트가 flush로 맞춘 값을 stale 캐시 sync가 되돌린 버그**였음.

### 적용한 수정

| 커밋 | 내용 |
|------|------|
| `78f0d4b` | `getEffectiveFavorite`에 **baseline** 반영 (`pending → baseline → 서버`) |
| `c8aa224` | `seedFavoriteBaseline`은 **baseline 없을 때만** 시드 (stale 덮어쓰기 방지) |
| (같은 커밋) | `flush`가 `pendingRef`로 **최신 pending** 읽기 |

### 프론트 책임 범위

- **가능:** 목록 토글 → 상세/목록 왕복 시 flush 전·후 UI 일관성 (서버 GET이 늦어도)
- **불가/한계:** flush API 실패, 서버 200인데 미저장, 다중 기기 변경은 별도 처리 필요

---

## 4. 검토했던 표시 보강 방법 (4가지)

| # | 방법 | 목록→상세 | 상세→목록 | 비고 |
|---|------|-----------|-----------|------|
| 1 | merge 시 `isFavorite` 보존 | △ | ✗ | 상세만, 상세 내 토글과 충돌 가능 |
| 2 | **baseline을 effective에 포함** | ✓ | ✓ | **채택** |
| 3 | optimistic merge 우선 (refetch 판별) | ✓ | △ | 복잡, 목록은 별도 처리 필요 |
| 4 | refetch 완료까지 pending 유지 | ✓ | ✓ | 상태 머신 무거움 |

---

## 5. 서버와의 미스매치 위험

| 상황 | UI vs 서버 | 비고 |
|------|------------|------|
| flush 전 | UI만 앞섬 | 의도적 (지연 flush) |
| flush API 실패 | rollback → baseline/서버 쪽으로 복귀 | **에러 UI 없음** (개선 여지) |
| flush 성공 + GET stale | UI = baseline (맞음) | baseline이 버퍼 |
| flush 성공 + 서버 미저장 | UI ★ / 서버 ☆ | 드묾, 감지 어려움 |
| 다른 기기에서 변경 | baseline 고착 시 어긋날 수 있음 | reconcile 미구현 |
| 세션 | `baseline`은 `IndexPage` 마운트 동안 유지 | 컨텍스트 리셋해도 baseline 유지 |

**현재 약점:** refetch 완료 후 **서버 값으로 baseline을 다시 맞추는(reconcile) 단계 없음**.  
flush가 정확했다면 문제없으나, 다중 기기·장시간 세션에서는 drift 가능.

---

## 6. 서버 응답으로 UI가 갱신되는 타이밍

```
토글 → pending (즉시)
     ↓
화면 전환 → flush → API 쓰기 → baseline 갱신
     ↓
invalidateQueries (keyword / place / detail)
     ↓
refetch → React Query 캐시 갱신
```

- **잘 된 점:** 쓰기 시점 명확, stale GET이 UI를 깨지 않게 baseline 우선
- **약한 점:** refetch 후에도 표시는 baseline 우선 → **서버가 진실이면 baseline과 reconcile 안 함**

---

## 7. 추후 보강 (보류)

### reconcile (권장)

```
refetch 성공 && 해당 locker pending 없음
  && server.isFavorite !== baseline.get(lockerId)
    → baseline을 server 값으로 갱신
```

주의: flush 직후 짧은 구간은 stale GET과 구분 필요 (타임스탬프 / flush 직후 스킵 / 응답 body에 isFavorite 포함 등).

### 기타

- flush 실패 시 토스트·재시도
- 검색 컨텍스트 종료 시 `baseline` 초기화 여부 정책
- 다중 기기: invalidate 주기 또는 포커스 시 reconcile

---

## 8. 관련 커밋 타임라인 (ZIM-29)

```
512acda feat: 검색 컨텍스트 즐겨찾기 토글 API 연동
5cf6b92 fix: flush 중 pending 상태 유실 방지
5514d2f fix: 서버 refetch 시 즐겨찾기 baseline 동기화 (seed 정책 — 이후 c8aa224에서 일부 조정)
f7d59a5 fix: useMemo/useCallback 의존성 정리
06984b0 refactor: 인증 팝업 Zustand selector
28ad362 refactor: overlay 제네릭
78f0d4b fix: flush 후 표시에 baseline 반영
c8aa224 fix: flush 후 baseline stale 덮어쓰기 방지 + pendingRef
```

---

## 9. 테스트

`apps/web/src/features/search/model/favorite-locker-session.test.ts`

- baseline / pending / flush / seed / effective 우선순위 단위 테스트

수동 QA 권장:

1. 목록 ★ → 바로 상세 → ★ 유지
2. 상세 → 목록 복귀 → ★ 유지
3. 목록에서 ★ → ☆ 취소 후 상세 진입 → API 호출 없음
4. 비로그인 → 로그인 팝업
