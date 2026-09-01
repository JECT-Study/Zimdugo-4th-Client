import { describe, expect, it } from "vitest";
import {
  createBottomMapInset,
  createMapInset,
  EMPTY_MAP_INSET,
  mergeMapInsets,
} from "./map-inset";

describe("createMapInset", () => {
  it("leaves the sides that were not named alone", () => {
    expect(createMapInset({ bottom: 191 })).toEqual({
      top: 0,
      right: 0,
      bottom: 191,
      left: 0,
    });
  });

  it("carries a horizontal inset the same way as a vertical one", () => {
    // 좌측 패널이 들어올 자리. 소비하는 쪽은 같은 타입만 본다.
    expect(createMapInset({ left: 420 })).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 420,
    });
  });
});

describe("createBottomMapInset", () => {
  it("treats a measured height as the bottom side", () => {
    expect(createBottomMapInset(191)).toEqual({
      ...EMPTY_MAP_INSET,
      bottom: 191,
    });
  });

  /**
   * 값 하나였을 때 null 은 "아직 못 쟀다" 와 "밀어 올릴 단계가 아니다" 를 겸했다.
   * 둘 다 지도를 가리지 않는 상태이므로 0 으로 모은다.
   */
  it("treats an unmeasured or absent sheet as covering nothing", () => {
    expect(createBottomMapInset(null)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(undefined)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(0)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(-1)).toEqual(EMPTY_MAP_INSET);
  });
});

describe("mergeMapInsets", () => {
  it("keeps the deepest cover on each side", () => {
    expect(
      mergeMapInsets(
        createMapInset({ bottom: 191 }),
        createMapInset({ bottom: 111, left: 420 }),
      ),
    ).toEqual({ top: 0, right: 0, bottom: 191, left: 420 });
  });

  /**
   * 같은 변을 두 겹이 가려도 지도가 잃는 자리는 더 깊은 쪽까지다. 더하면 실제보다
   * 많이 가려진 것으로 보고 컨트롤이 필요 이상으로 밀려 올라간다.
   */
  it("does not add overlapping covers together", () => {
    expect(
      mergeMapInsets(
        createMapInset({ bottom: 100 }),
        createMapInset({ bottom: 60 }),
      ).bottom,
    ).toBe(100);
  });

  it("is empty when nothing covers the map", () => {
    expect(mergeMapInsets()).toEqual(EMPTY_MAP_INSET);
  });
});
