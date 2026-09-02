import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * `public/sw.js` 는 번들러를 거치지 않아 저장소의 상수를 가져다 쓸 수 없다.
 * 워커와 페이지가 같은 문자열을 각자 적어 두고 있어, 한쪽만 고치면 통지가
 * 조용히 끊긴다. 그 어긋남을 여기서 잡는다.
 */
const readSource = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

describe("서비스 워커와 페이지가 나눠 가진 상수", () => {
  const serviceWorkerSource = readSource("../../../../public/sw.js");
  const pushDeviceSource = readSource("../hooks/usePushDevice.ts");

  it("구독 소실 통지 이름을 양쪽이 같은 값으로 쓴다", () => {
    const messageName = "zimdugo:push-subscription-lost";

    expect(serviceWorkerSource).toContain(messageName);
    expect(pushDeviceSource).toContain(messageName);
  });

  it("워커가 구독 해제 경로를 앱과 같은 주소로 부른다", () => {
    expect(serviceWorkerSource).toContain("/api/v1/push/subscriptions");
    expect(serviceWorkerSource).toContain('method: "DELETE"');
    // 쿠키가 실리지 않으면 서버가 기기를 가리지 못해 조용히 다른 기기를 지운다.
    expect(serviceWorkerSource).toContain('credentials: "include"');
  });

  it("워커가 등록 URL 의 쿼리에서 API 주소를 읽는다", () => {
    // useServiceWorker 가 ?api= 로 넘긴다. 키가 어긋나면 상대 경로로 요청해
    // 다른 오리진을 때린다.
    expect(serviceWorkerSource).toContain('searchParams.get("api")');
    expect(readSource("../../../shared/hooks/useServiceWorker.ts")).toContain(
      "?api=",
    );
  });
});
