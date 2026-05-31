### 변경 사항

- 로그인 `/login` search: `code`를 선택 속성으로 정리, `returnPath`만 넘기는 navigate 타입 정합
- `AuthRequirePopup`·`useRequireAuth` navigate search 보완
- 내 위치 마커 테두리: `palette.white` → `vars.color.icon.white`
- 제어형 하단 탭 링크: `activeOverride` 타입 좁히기 (TS2322)
- **지도 로드 오류 시** 검색·GPS 컨트롤 스켈레톤/실컨트롤 숨김 — 오류 UI·재시도 버튼만 표시
- **로그인 페이지** CSS 청크 지연 대응: `LoginPageSkeleton` + `useLoginPageStyleReady`(rAF probe) + 타임아웃 시 인라인 레이아웃 폴백 (`SocialLoginStack` 폴백 props)

### 작업 배경

지도 스켈레톤 PR(#35) 머지 후 Vercel 빌드·타입체크에서 발견된 사소한 오류를 스켈레톤 작업과 분리해 수정합니다. 지도 API 오류 시 컨트롤 겹침 UX와, 홈과 동일 패턴의 로그인 스켈레톤·인라인 폴백도 함께 정리했습니다.

`/login`은 `shouldShowBottomTab`으로 BottomTabBar가 숨겨져 있어 탭바·로그인 스켈레톤이 동시에 노출되지 않습니다.

### 검증 결과

| 항목 | 결과 |
|------|------|
| `pnpm --filter web build` | 통과 |
| `pnpm run test:web` | **25 passed** / 4 failed (`useLocationTracking` — `document is not defined`, **본 PR 범위 밖**) |
| PR 관련 단위 테스트 | `-map-control-visibility`, `report`, `map-idle-controller`, `map-marker` 통과 |

### 스크린샷 (390×844, 로컬 dev)

> `?raw=1` 절대 URL · **2열 HTML 테이블** (열당 `width="100%"`)

<table>
<tr>
<td width="50%" valign="top" align="center">
<b>홈 — 하단 탭·지도</b><br/>
<img src="https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/01-home-map-controls.png?raw=1" width="100%" alt="홈"/>
</td>
<td width="50%" valign="top" align="center">
<b>로그인 — CSS 로드 전 스켈레톤</b><br/>
<img src="https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/05-login-skeleton.png?raw=1" width="100%" alt="로그인 스켈레톤"/>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<b>비로그인 → 제보 탭 → 로그인 팝업</b><br/>
<img src="https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/03-auth-popup.png?raw=1" width="100%" alt="로그인 팝업"/>
</td>
<td width="50%" valign="top" align="center">&nbsp;</td>
</tr>
</table>

### 테스트 계획

#### 에이전트·로컬 브라우저 QA (완료)

- [x] production build 통과
- [x] `/login` CSS 로드 전 스켈레톤 → 스타일 적용 후 소셜 로그인 UI
- [x] `/login?returnPath=/my`, `/login?returnPath=/report` — `returnPath` 유지
- [x] **`/login`에서 BottomTabBar 미노출**
- [x] 비로그인 → 제보 탭 → 「로그인이 필요한 기능입니다」 팝업
- [x] 팝업 「로그인하기」→ `/login?returnPath=/report` 이동
- [x] 홈 하단 탭 링크 노출·클릭 가능
- [x] **지도 로드 오류 시** 컨트롤 미노출, 「지도 다시 불러오기」만 표시

#### 리뷰어 로컬 확인 권장 (환경 의존)

- [ ] **내 위치 마커 흰 테두리** — 네이버 지도 Client ID + 위치 권한 허용 후 홈 GPS ON
- [ ] **제어형 `activeTab`(스토리북)** — BottomTabBar 스토리 (WIP/untracked)

※ OAuth 실제 완료는 스테이징/본인 계정으로 1회 확인하면 충분합니다.
