import { describe, expect, it } from "vitest";
import {
  createBottomMapInset,
  createMapInset,
  EMPTY_MAP_INSET,
  mergeMapInsets,
} from "./map-inset";

describe("createMapInset", () => {
  it("안 적은 변은 건드리지 않는다", () => {
    expect(createMapInset({ bottom: 191 })).toEqual({
      top: 0,
      right: 0,
      bottom: 191,
      left: 0,
    });
  });

  it("가로로 가리는 값도 세로와 같은 방식으로 나른다", () => {
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
  it("잰 높이를 하단 값으로 본다", () => {
    expect(createBottomMapInset(191)).toEqual({
      ...EMPTY_MAP_INSET,
      bottom: 191,
    });
  });

  /**
   * 값 하나였을 때 null 은 "아직 못 쟀다" 와 "밀어 올릴 단계가 아니다" 를 겸했다.
   * 둘 다 지도를 가리지 않는 상태이므로 0 으로 모은다.
   */
  it("못 쟀거나 시트가 없으면 가리지 않는 것으로 본다", () => {
    expect(createBottomMapInset(null)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(undefined)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(0)).toEqual(EMPTY_MAP_INSET);
    expect(createBottomMapInset(-1)).toEqual(EMPTY_MAP_INSET);
  });
});

describe("mergeMapInsets", () => {
  it("변마다 가장 깊이 가리는 값을 남긴다", () => {
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
  it("겹쳐 가리는 값을 더하지 않는다", () => {
    expect(
      mergeMapInsets(
        createMapInset({ bottom: 100 }),
        createMapInset({ bottom: 60 }),
      ).bottom,
    ).toBe(100);
  });

  it("아무것도 가리지 않으면 비어 있다", () => {
    expect(mergeMapInsets()).toEqual(EMPTY_MAP_INSET);
  });
});
