### 변경 사항
- 로그인 `/login` search: `code`를 선택 속성으로 정리, `returnPath`만 넘기는 navigate 타입 정합
- `AuthRequirePopup`·`useRequireAuth` navigate search 보완
- 내 위치 마커 테두리: `palette.white` → `vars.color.icon.white`
- 제어형 하단 탭 링크: `activeOverride` 타입 좁히기 (TS2322)

### 작업 배경
지도 스켈레톤 PR(#35) 머지 후 Vercel 빌드·타입체크에서 발견된 사소한 오류를 스켈레톤 작업과 분리해 수정합니다.

### 검증 결과
| 항목 | 결과 |
|------|------|
| `pnpm --filter web build` | 통과 |
| `pnpm run test:web` | 24 passed / 4 failed (`useLocationTracking` — `document is not defined`, **이번 PR 범위 밖**) |

### 스크린샷 (390×844, 로컬 dev)

> GitHub PR 본문에서는 **상대 경로 이미지가 깨질 수 있어** `?raw=1` 절대 URL을 사용합니다.

**홈 — 하단 탭·지도 컨트롤**

![홈](https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/01-home-map-controls.png?raw=1)

**로그인 — returnPath=/my**

![로그인 my](https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/02-login-return-path.png?raw=1)

**비로그인 → 제보 탭 → 로그인 팝업**

![로그인 팝업](https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/03-auth-popup.png?raw=1)

**팝업 「로그인하기」→ `/login?returnPath=/report`**

![로그인 report](https://github.com/JECT-Study/Zimdugo-4th-Client/blob/fix/minor-bugs/docs/pr/fix-minor-bugs/assets/04-login-return-path-report.png?raw=1)

### 테스트 계획

#### 에이전트·로컬 브라우저 QA (완료)
- [x] production build 통과
- [x] `/login?returnPath=/my` 화면 로드
- [x] 비로그인 → 제보 탭 → 홈 유지 + 「로그인이 필요한 기능입니다」 팝업
- [x] 팝업 「로그인하기」→ `/login?returnPath=/report` 이동
- [x] 하단 탭 링크(홈·제보·MY·설정) 노출·클릭 가능

#### 리뷰어 로컬 확인 권장 (환경 의존)
- [ ] **내 위치 마커 흰 테두리** — `.env`에 네이버 지도 Client ID 설정 + 브라우저 위치 권한 허용 후 홈에서 GPS ON
- [ ] **제어형 `activeTab`(스토리북)** — `pnpm storybook` 후 BottomTabBar 스토리 (스토리 파일은 아직 WIP/untracked)

※ 소셜 로그인(OAuth) 실제 완료까지는 **스테이징/본인 계정**으로 한 번만 눌러보면 충분합니다. 이번 PR은 타입·빌드·라우팅 search 정합이 핵심입니다.
