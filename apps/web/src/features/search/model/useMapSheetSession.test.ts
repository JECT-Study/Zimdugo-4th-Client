import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  DEFAULT_SEARCH_COORDINATES,
  resolveInitialMapSheetSession,
} from "./useMapSheetSession";

const detail = (overrides: Partial<LockerDetailItem> = {}): LockerDetailItem =>
  ({
    lockerId: 164,
    title: "강남역 1번 출구",
    latitude: 37.5,
    longitude: 127.03,
    ...overrides,
  }) as LockerDetailItem;

describe("resolveInitialMapSheetSession", () => {
  it("홈이면 시트를 닫아 둔다", () => {
    expect(
      resolveInitialMapSheetSession({
        screen: { target: "idle", lockerId: undefined },
        deepLinkDetail: null,
      }),
    ).toEqual({
      sheetMode: "idle",
      selectedLockerDetail: null,
      selectedMapPin: null,
    });
  });

  it("목록 화면이면 목록 시트를 연다", () => {
    expect(
      resolveInitialMapSheetSession({
        screen: { target: "list", lockerId: undefined },
        deepLinkDetail: null,
      }).sheetMode,
    ).toBe("list");
  });

  it("로더가 상세를 채웠으면 상세를 바로 연다", () => {
    const session = resolveInitialMapSheetSession({
      screen: { target: "detail", lockerId: 164 },
      deepLinkDetail: detail(),
    });

    expect(session.sheetMode).toBe("detail");
    expect(session.selectedLockerDetail?.lockerId).toBe(164);
    expect(session.selectedMapPin).toMatchObject({
      pinType: "LOCKER",
      lockerId: 164,
      latitude: 37.5,
      longitude: 127.03,
    });
  });

  it("좌표가 비어 있으면 기본 좌표에 핀을 둔다", () => {
    const session = resolveInitialMapSheetSession({
      screen: { target: "detail", lockerId: 164 },
      deepLinkDetail: detail({ latitude: undefined, longitude: undefined }),
    });

    expect(session.selectedMapPin).toMatchObject({
      latitude: DEFAULT_SEARCH_COORDINATES.lat,
      longitude: DEFAULT_SEARCH_COORDINATES.lng,
    });
  });

  it("상세 내용이 없으면 빈 시트를 열지 않는다", () => {
    expect(
      resolveInitialMapSheetSession({
        screen: { target: "detail", lockerId: 164 },
        deepLinkDetail: null,
      }),
    ).toEqual({
      sheetMode: "idle",
      selectedLockerDetail: null,
      selectedMapPin: null,
    });
  });
});
