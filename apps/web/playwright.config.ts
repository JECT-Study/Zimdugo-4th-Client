import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
// Naver 지도 키가 도메인 화이트리스트로 묶여 있다. localhost 로 맞춰야 SDK 가 붙는다.
const BASE_URL = `http://localhost:${PORT}`;

/**
 * 지도 컨트롤·바텀시트처럼 레이아웃과 애니메이션이 얽힌 동작을 검증한다.
 *
 * 단위 테스트로는 잡히지 않는 영역이다. jsdom 은 레이아웃을 계산하지 않고
 * motion 애니메이션도 진행되지 않아, 시트가 실제로 어디까지 올라왔는지 알 수 없다.
 */
export default defineConfig({
  testDir: "./e2e",
  // 애니메이션 안착을 기다리는 단언이 많아 기본값보다 넉넉히 준다.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // 실패를 눈감고 넘어가지 않도록 CI 에서는 only 를 금지한다.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // 실패 원인을 눈으로 확인할 수 있게 남긴다.
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        // 뷰포트를 스펙마다 바꾸므로 기기 기본값 대신 고정값을 쓴다.
        viewport: { width: 430, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  /**
   * 프리뷰 서버로 돌린다.
   *
   * dev 서버는 첫 요청마다 모듈을 변환하느라 지도 SDK 가 붙기 전에 단언이 먼저
   * 끝나는 일이 잦다. 빌드 결과로 띄우면 프로덕션과 같은 번들을 보게 된다.
   */
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
