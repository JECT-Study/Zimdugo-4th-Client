import { describe, expect, it } from "vitest";
import { resolveDetailSheetVisibleHeight } from "#/composites/locker-detail/LockerDetailBottomSheet";
import { resolveSearchListStageVisibleHeight } from "#/composites/search/SearchListBottomSheet";
import {
  createBottomMapInset,
  EMPTY_MAP_INSET,
} from "#/entities/map/model/map-inset";
import {
  resolveMapControlTopLimitPx,
  resolveSheetFullSnapPoint,
  resolveSheetFullStageSnapPoint,
  resolveSheetTopLimitPx,
} from "#/shared/lib/app-chrome-layout";
import {
  resolveMapControlBottomPx,
  resolveVisibleSheetKind,
  shouldShowHomeSearchBar,
  shouldShowMapControls,
} from "./-map-control-visibility";

describe("shouldShowHomeSearchBar", () => {
  it("hides home search bar when map loading failed", () => {
    expect(shouldShowHomeSearchBar({ hasMapError: true })).toBe(false);
  });
});

describe("shouldShowMapControls", () => {
  it("hides map controls when map loading failed", () => {
    expect(
      shouldShowMapControls({
        isMapLoading: false,
        hasMapError: true,
        hasMapInstance: false,
      }),
    ).toBe(false);
  });
});

describe("resolveMapControlBottomPx", () => {
  it("밀어 올릴 단계가 아니면 기본 하단 위치를 쓴다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: EMPTY_MAP_INSET,
        windowHeightPx: 812,
      }),
    ).toBe(70);
  });

  it("시트 위로 컨트롤을 올린다", () => {
    // 상세 미니 시트 111px + 간격 12px. 기본 70px 이면 시트 뒤로 들어간다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(111),
        windowHeightPx: 812,
      }),
    ).toBe(123);
  });

  it("시트가 기본 위치보다 낮으면 기본 위치를 유지한다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(40),
        windowHeightPx: 812,
      }),
    ).toBe(70);
  });
});

describe("두 시트가 같은 규칙을 따른다", () => {
  it("full 은 실측 높이로 판정해 양쪽 다 숨긴다", () => {
    // 예전에는 목록만 단계 상수가 null 을 줘서 기본 위치(70px)로 되돌아갔고,
    // 그 자리는 시트 뒤라 보이지도 눌리지도 않았다. 상세는 실측 높이를 보고해
    // 정상적으로 숨겨졌다. 같은 화면에서 두 시트의 동작이 갈렸다.
    const 상세full = 622;
    const 목록full = 696;

    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(상세full),
        windowHeightPx: 808,
      }),
    ).toBeNull();
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(목록full),
        windowHeightPx: 808,
      }),
    ).toBeNull();
  });
});

describe("full 시트가 화면을 다 덮지 못할 때", () => {
  it("위에 자리가 남으면 컨트롤을 시트 위로 올린다", () => {
    // 콘텐츠가 짧은 보관함은 full 이어도 시트 상단이 400px 에 머문다.
    // 808 - 400 = 408 을 피하고도 상단 경계(808 - 216 = 592)를 지킬 수 있다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(408),
        windowHeightPx: 808,
      }),
    ).toBe(420);
  });

  it("자리가 없으면 기본 위치로 되돌리지 않고 숨긴다", () => {
    // 실시간 카드가 있는 보관함은 full 이 112px 까지 올라간다. 예전에는 full 을
    // 무조건 null 로 봐서 컨트롤을 기본 70px 에 뒀는데, 그 자리는 시트 뒤라
    // 보이지도 눌리지도 않았다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(696),
        windowHeightPx: 808,
      }),
    ).toBeNull();
  });
});

describe("resolveDetailSheetVisibleHeight", () => {
  it("미니와 하프까지 컨트롤이 따라 올라갈 높이를 준다", () => {
    expect(resolveDetailSheetVisibleHeight("mini")).toBe(111);
    expect(resolveDetailSheetVisibleHeight("half")).toBe(270);
  });

  it("full·dismiss 는 따라 올릴 단계가 아니다", () => {
    expect(resolveDetailSheetVisibleHeight("full")).toBeNull();
    expect(resolveDetailSheetVisibleHeight("dismiss")).toBeNull();
  });
});

describe("resolveSearchListStageVisibleHeight", () => {
  it("화면 높이에 따라 단계별 높이를 계산한다", () => {
    // mini: min(242, round(812 * 0.22)) = 179 / half: min(481, round(812 * 0.42)) = 341
    expect(resolveSearchListStageVisibleHeight("mini", 812)).toBe(179);
    expect(resolveSearchListStageVisibleHeight("half", 812)).toBe(341);
  });

  it("full·dismiss 는 따라 올릴 단계가 아니다", () => {
    expect(resolveSearchListStageVisibleHeight("full", 812)).toBeNull();
    expect(resolveSearchListStageVisibleHeight("dismiss", 812)).toBeNull();
  });
});

describe("resolveMapControlBottomPx 상단 경계", () => {
  it("시트를 피한 자리가 경계를 넘으면 잘라 내지 않고 숨긴다", () => {
    // 390px 화면 + 상세 하프 191px. 상단 경계에 맞춰 174px 로 내리면 스택 아래쪽
    // 내 위치 버튼이 174~216px 에 놓이는데 시트 상단이 191px 이라 도로 시트 뒤로
    // 들어간다. 이 함수가 없애려던 문제라 잘라 내는 대신 배치 불가로 판정한다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 390,
      }),
    ).toBeNull();
  });

  it("시트와 경계를 모두 지킬 수 있으면 시트 위에 그대로 올린다", () => {
    // 하프 시트 191px + 간격 12 + 스택 96 + 경계 120 = 419px 가 최소 높이다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 419,
      }),
    ).toBe(203);
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 418,
      }),
    ).toBeNull();
  });

  it("타이머 버튼이 서면 그만큼 더 높은 화면을 요구한다", () => {
    // 타이머 컨트롤은 버튼 42 + 배지 여백 13 = 55px 에 스택 간격 12 를 더 쓴다.
    // 하프 시트 191 + 12 + 스택 96 + 67 + 경계 120 = 486px 가 최소 높이가 된다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 419,
        extraStackHeightPx: 55,
      }),
    ).toBeNull();
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 486,
        extraStackHeightPx: 55,
      }),
    ).toBe(203);
  });

  it("타이머 버튼이 없으면 예약 높이가 그대로다", () => {
    // 0 을 넘겨도 간격이 붙지 않아야 기존 판정과 같은 결과가 나온다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 419,
        extraStackHeightPx: 0,
      }),
    ).toBe(203);
  });

  it("미니 시트는 낮은 화면에서도 자리가 남는다", () => {
    // 111 + 12 + 96 + 120 = 339px. 390px 화면이면 하프는 못 놓아도 미니는 놓는다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(111),
        windowHeightPx: 390,
      }),
    ).toBe(123);
  });

  it("밀어 올릴 단계가 아니어도 자리가 없으면 null 을 준다", () => {
    // 낮은 화면에서 상세가 full 로 올라가면 시트 쪽이 null 을 준다. 예전에는 이때
    // 상단 경계를 아예 안 보고 기본 70px 을 그대로 써서, 스택 상단이 94px 에 놓여
    // 검색 바를 덮은 채 시트 뒤에 깔렸다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: EMPTY_MAP_INSET,
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });

  it("배치할 자리가 없으면 null 을 준다", () => {
    // 260px 화면이면 상단 경계를 지키는 bottom 이 44px 라 기본 70px 보다 낮다.
    // 기본 위치로 되돌리면 시트 뒤에 깔린 채 검색 바만 가리므로 숨기는 편이 낫다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });
});

describe("로딩 스켈레톤과 실제 컨트롤의 위치 일치", () => {
  it("같은 입력이면 같은 값을 준다", () => {
    // 스켈레톤은 이 값을 bottomPx 로 그대로 받는다. 예전에는 70px 로 하드코딩돼
    // 있어서 지도가 준비되는 순간 실제 컨트롤 위치로 튀었다.
    const options = {
      baseBottomPx: 70,
      obscuredInset: createBottomMapInset(191),
      windowHeightPx: 812,
    };

    expect(resolveMapControlBottomPx(options)).toBe(203);
  });

  it("배치 불가면 null 이라 스켈레톤도 렌더하지 않는다", () => {
    // 실제 컨트롤이 숨겨지는 조건과 같아야 한다. 스켈레톤만 남기면 지도가
    // 준비되는 순간 버튼이 사라진다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(191),
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });
});

describe("resolveVisibleSheetKind", () => {
  const base = {
    sheetMode: "list",
    isMapLoading: false,
    isSearchOpen: false,
    hasDetailContent: false,
  } as const;

  it("목록 단계면 목록 시트를 본다", () => {
    expect(resolveVisibleSheetKind(base)).toBe("list");
  });

  it("상세 단계에 그릴 내용이 있으면 상세 시트를 본다", () => {
    expect(
      resolveVisibleSheetKind({
        ...base,
        sheetMode: "detail",
        hasDetailContent: true,
      }),
    ).toBe("detail");
  });

  it("상세 단계여도 그릴 내용이 없으면 시트가 없다", () => {
    // 조회 실패·삭제된 보관함. 시트는 안 뜨는데 단계만 detail 로 남는다.
    expect(
      resolveVisibleSheetKind({
        ...base,
        sheetMode: "detail",
        hasDetailContent: false,
      }),
    ).toBeNull();
  });

  it("검색 오버레이가 덮으면 시트가 없다", () => {
    expect(resolveVisibleSheetKind({ ...base, isSearchOpen: true })).toBeNull();
    expect(
      resolveVisibleSheetKind({
        ...base,
        sheetMode: "detail",
        hasDetailContent: true,
        isSearchOpen: true,
      }),
    ).toBeNull();
  });

  it("지도가 로딩 중이면 시트가 없다", () => {
    expect(resolveVisibleSheetKind({ ...base, isMapLoading: true })).toBeNull();
  });

  it("시트를 띄우지 않는 단계는 시트가 없다", () => {
    expect(resolveVisibleSheetKind({ ...base, sheetMode: "idle" })).toBeNull();
    expect(
      resolveVisibleSheetKind({ ...base, sheetMode: "filter" }),
    ).toBeNull();
    expect(
      resolveVisibleSheetKind({ ...base, sheetMode: "addressList" }),
    ).toBeNull();
  });

  it("시트가 없으면 컨트롤은 기본 자리로 돌아온다", () => {
    // 실측 높이 state 는 시트가 사라져도 남아 있다. 시트가 보이지 않으면 그 값을
    // 쓰지 않는다는 것이 이 조합의 핵심이다.
    const visibleSheetKind = resolveVisibleSheetKind({
      ...base,
      isSearchOpen: true,
    });

    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        obscuredInset: createBottomMapInset(
          visibleSheetKind === null
            ? null
            : resolveSearchListStageVisibleHeight("half", 812),
        ),
        windowHeightPx: 812,
      }),
    ).toBe(70);
  });
});

describe("크롬 아래 경계", () => {
  it("안전 영역이 없으면 검색 바 바닥 바로 아래에 선을 둔다", () => {
    // 검색 바는 60px 에서 시작해 48px 높이라 바닥이 108px 이다.
    expect(resolveSheetTopLimitPx(0)).toBe(112);
  });

  it("노치 기기에서는 검색 바가 내려간 만큼 선도 내린다", () => {
    // 예전에는 이 선이 112 로 고정이라, 안전 영역이 4px 만 넘어도 full 시트가
    // 검색 바를 덮어 아무것도 누를 수 없었다.
    expect(resolveSheetTopLimitPx(59)).toBe(171);
  });

  it("음수가 들어와도 선을 끌어올리지 않는다", () => {
    expect(resolveSheetTopLimitPx(-20)).toBe(112);
  });

  it("지도 컨트롤도 같은 안전 영역만큼 내려간다", () => {
    // 시트보다 간격을 넓게(12px) 두는 것 말고는 같은 기준이다.
    expect(resolveMapControlTopLimitPx(0)).toBe(120);
    expect(resolveMapControlTopLimitPx(59)).toBe(179);
  });
});

describe("resolveSheetFullSnapPoint", () => {
  const base = { topLimitPx: 112, maxSnapPoint: 760, windowHeight: 812 };

  it("콘텐츠가 짧으면 그 높이만큼만 올린다", () => {
    // 결과가 두어 개인데도 화면 꼭대기까지 덮던 것을 고친 것이다.
    // 812 - 320 - 손잡이 24 - 여유 32 = 436
    expect(resolveSheetFullSnapPoint({ ...base, contentHeight: 320 })).toBe(
      436,
    );
  });

  it("손잡이 자리와 아래 여유를 함께 남긴다", () => {
    // 딱 맞추면 마지막 항목이 화면 바닥에 붙어 잘린 것처럼 보인다. 손잡이는 시트
    // 프레임이 콘텐츠 위에 늘 두는 자리라 재는 쪽에서 안 잡힌다.
    const withGap = resolveSheetFullSnapPoint({ ...base, contentHeight: 320 });
    const withoutGap = base.windowHeight - 320;

    expect(withoutGap - withGap).toBe(24 + 32);
  });

  it("콘텐츠가 길면 상한에서 멈춘다", () => {
    expect(resolveSheetFullSnapPoint({ ...base, contentHeight: 900 })).toBe(
      112,
    );
  });

  it("아직 못 쟀으면 상한을 준다", () => {
    // 짧다고 가정하면 낮게 떴다가 올라가고, 길다고 가정하면 반대로 움직인다.
    // 어느 쪽이든 올라오는 도중에 높이가 바뀌어 보인다.
    expect(resolveSheetFullSnapPoint({ ...base, contentHeight: null })).toBe(
      112,
    );
    expect(resolveSheetFullSnapPoint(base)).toBe(112);
  });

  it("화면이 낮아 상한이 선보다 아래면 스냅 범위를 뒤집지 않는다", () => {
    // minSnapPoint 가 maxSnapPoint 를 넘으면 시트가 놓일 자리가 없어진다.
    expect(
      resolveSheetFullSnapPoint({
        contentHeight: null,
        topLimitPx: 112,
        maxSnapPoint: 98,
        windowHeight: 150,
      }),
    ).toBe(98);
  });

  it("콘텐츠가 아주 짧아도 최대 스냅을 넘지 않는다", () => {
    expect(resolveSheetFullSnapPoint({ ...base, contentHeight: 10 })).toBe(746);
  });
});

describe("resolveSheetFullStageSnapPoint", () => {
  const base = {
    topLimitPx: 112,
    maxSnapPoint: 760,
    windowHeight: 812,
    halfSnapPoint: 471,
  };

  it("콘텐츠가 half 보다 길면 그 위에 full 을 둔다", () => {
    // 812 - 320 - 손잡이 24 - 여유 32 = 436. half(471) 보다 위다.
    expect(
      resolveSheetFullStageSnapPoint({ ...base, contentHeight: 320 }),
    ).toBe(436);
  });

  it("콘텐츠가 half 보다 짧으면 full 을 두지 않는다", () => {
    // 억지로 두면 half 와 같은 자리에 겹쳐, 시트가 픽셀에서 단계를 되찾지 못한다.
    expect(
      resolveSheetFullStageSnapPoint({ ...base, contentHeight: 120 }),
    ).toBeNull();
  });

  it("half 와 같은 자리여도 두지 않는다", () => {
    // 812 - 285 - 56 = 471 로 half 와 정확히 겹치는 경우다.
    expect(
      resolveSheetFullStageSnapPoint({ ...base, contentHeight: 285 }),
    ).toBeNull();
  });

  it("half 코앞이면 두지 않는다", () => {
    // 812 - 286 - 56 = 470 으로 half(471) 보다 1px 위다. 손으로는 오갈 수 없는
    // 간격이라 단계만 하나 더 생기고, 지도를 눌러 접는 규칙이 걸리지 않는다.
    expect(
      resolveSheetFullStageSnapPoint({ ...base, contentHeight: 286 }),
    ).toBeNull();
  });

  it("손잡이 높이만큼 벌어지면 단계로 인정한다", () => {
    // 812 - 309 - 56 = 447 로 half(471) 와 24px 떨어진다.
    expect(
      resolveSheetFullStageSnapPoint({ ...base, contentHeight: 309 }),
    ).toBe(447);
  });

  it("아직 못 쟀으면 상한에 두어 지금까지와 같게 연다", () => {
    expect(resolveSheetFullStageSnapPoint({ ...base })).toBe(112);
  });
});

/**
 * 값 하나(`sheetVisibleHeightPx`)를 가려지는 영역으로 바꾸면서, null 이 겸하던
 * "밀어 올릴 단계가 아니다" 가 하단 0 으로 합쳐졌다. 두 입력이 같은 자리를
 * 가리키는지 고정한다.
 */
describe("가려지는 영역이 비어 있을 때", () => {
  const options = {
    baseBottomPx: 70,
    windowHeightPx: 812,
  };

  it("아무것도 가리지 않으면 기본 자리에 놓는다", () => {
    expect(
      resolveMapControlBottomPx({ ...options, obscuredInset: EMPTY_MAP_INSET }),
    ).toBe(70);
  });

  it("하단 0 은 아무것도 가리지 않는 것과 같은 자리다", () => {
    expect(
      resolveMapControlBottomPx({
        ...options,
        obscuredInset: createBottomMapInset(0),
      }),
    ).toBe(
      resolveMapControlBottomPx({ ...options, obscuredInset: EMPTY_MAP_INSET }),
    );
  });

  /**
   * 가로 방향은 아직 아무도 만들지 않지만, 세로 배치가 그 값에 끌려가면
   * 좌측 패널이 들어오는 날 컨트롤이 엉뚱한 자리로 간다.
   */
  it("가로로 가리는 값은 세로 배치를 건드리지 않는다", () => {
    expect(
      resolveMapControlBottomPx({
        ...options,
        obscuredInset: { top: 0, right: 0, bottom: 0, left: 420 },
      }),
    ).toBe(70);
  });
});
