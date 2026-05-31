# fix/minor-bugs PR 검증 스크린샷

| 파일 | 설명 |
|------|------|
| `01-home-map-controls.png` | 홈 — 하단 탭·지도 (로드/오류 상태) |
| `03-auth-popup.png` | 제보 탭 클릭 → 로그인 필요 팝업 |
| `05-login-skeleton.png` | `/login` CSS 청크 도착 전 스켈레톤 (Storybook 캡처) |

PR 본문에는 `?raw=1` GitHub URL로 첨부합니다 (상대 경로는 PR에서 깨질 수 있음).

캡처: `05` — Storybook `LoginPageSkeleton/Mobile Viewport` (`npx playwright install chromium` 후 `node capture-login-skeleton.mjs`, Storybook `:6008`). 나머지 — `pnpm exec vite dev --port 3010`, `node capture-screenshots.mjs`.
