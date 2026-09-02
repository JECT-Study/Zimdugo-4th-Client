import { describe, expect, it } from "vitest";

import { urlBase64ToUint8Array } from "./push-subscription";

describe("urlBase64ToUint8Array", () => {
  /** 프로덕션 `GET /push/vapid-key` 가 실제로 내려주는 값. 끝에 `=` 이 붙어 있다. */
  const SERVER_PUBLIC_KEY =
    "BLpB8OmQGMwP03BTnvmBUrRJBaKX4o5C0Mmv3NXsZwIqWPVwKzRPGUP7v-LxwOV6LreEa5zpdtqMUsBfz3kTCtA=";

  it("서버가 주는 키를 65바이트 P-256 좌표로 푼다", () => {
    const decoded = urlBase64ToUint8Array(SERVER_PUBLIC_KEY);

    expect(decoded).toHaveLength(65);
    // 비압축 좌표는 0x04 로 시작한다.
    expect(decoded[0]).toBe(0x04);
  });

  it("패딩이 붙어 와도 빼고 와도 같은 값을 낸다", () => {
    expect(urlBase64ToUint8Array(SERVER_PUBLIC_KEY)).toEqual(
      urlBase64ToUint8Array(SERVER_PUBLIC_KEY.replace(/=+$/, "")),
    );
  });

  it("base64url 의 -_ 를 표준 알파벳으로 되돌린다", () => {
    // "-_" 를 그대로 atob 에 넣으면 던진다. 치환이 빠지면 이 단언에서 걸린다.
    expect(() => urlBase64ToUint8Array("-_-_")).not.toThrow();
    expect(urlBase64ToUint8Array("-_-_")).toEqual(
      new Uint8Array([0xfb, 0xff, 0xbf]),
    );
  });
});
