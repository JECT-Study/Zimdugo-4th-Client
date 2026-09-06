import { describe, expect, it } from "vitest";
import { resolveMapAttachFocus } from "./map-attach-focus";

const options = (
  overrides: Partial<Parameters<typeof resolveMapAttachFocus>[0]> = {},
) => ({
  lockerId: undefined,
  focusedLockerId: undefined,
  hasDetail: false,
  hasPendingPin: false,
  ...overrides,
});

describe("resolveMapAttachFocus", () => {
  it("맞출 곳이 없으면 아무것도 하지 않는다", () => {
    expect(resolveMapAttachFocus(options())).toBeNull();
  });

  it("딥링크로 연 상세는 그 좌표로 맞춘다", () => {
    expect(
      resolveMapAttachFocus(options({ lockerId: 164, hasDetail: true })),
    ).toBe("detail");
  });

  /**
   * 테마를 바꾸면 지도를 다시 만든다. 그때마다 다시 맞추면 사용자가 옮겨 둔 위치를
   * 덮어쓴다.
   */
  it("이미 맞춘 보관함은 지도를 다시 만들어도 다시 맞추지 않는다", () => {
    expect(
      resolveMapAttachFocus(
        options({ lockerId: 164, focusedLockerId: 164, hasDetail: true }),
      ),
    ).toBeNull();
  });

  it("다른 보관함으로 갈아타면 다시 맞춘다", () => {
    expect(
      resolveMapAttachFocus(
        options({ lockerId: 921, focusedLockerId: 164, hasDetail: true }),
      ),
    ).toBe("detail");
  });

  it("미뤄 둔 핀은 상세가 없을 때 맞춘다", () => {
    expect(resolveMapAttachFocus(options({ hasPendingPin: true }))).toBe("pin");
  });

  it("상세와 미뤄 둔 핀이 둘 다 있으면 상세가 앞선다", () => {
    expect(
      resolveMapAttachFocus(
        options({ lockerId: 164, hasDetail: true, hasPendingPin: true }),
      ),
    ).toBe("detail");
  });

  /**
   * 상세를 열고는 있지만 좌표를 모르는 상태다. 미뤄 둔 핀이 있으면 그쪽이 더 나은 답이다.
   */
  it("상세의 좌표가 아직 없으면 미뤄 둔 핀으로 내려간다", () => {
    expect(
      resolveMapAttachFocus(
        options({ lockerId: 164, hasDetail: false, hasPendingPin: true }),
      ),
    ).toBe("pin");
  });

  it("이미 맞춘 보관함이어도 미뤄 둔 핀이 있으면 그것은 맞춘다", () => {
    expect(
      resolveMapAttachFocus(
        options({
          lockerId: 164,
          focusedLockerId: 164,
          hasDetail: true,
          hasPendingPin: true,
        }),
      ),
    ).toBe("pin");
  });
});
