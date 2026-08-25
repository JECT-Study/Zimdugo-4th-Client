import { fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties, HTMLAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DraggableBottomSheet,
  resolveBottomSheetDragIntent,
  resolveBottomSheetExpandedProgress,
  resolveBottomSheetNextSnap,
  shouldStartBottomSheetDrag,
} from "./DraggableBottomSheet";

const { animateTargets, animationStop } = vi.hoisted(() => ({
  animateTargets: [] as number[],
  animationStop: vi.fn(),
}));

vi.mock("motion/react", () => {
  const createMotionValue = (initial: number) => {
    let value = initial;
    const listeners = new Set<(value: number) => void>();

    return {
      get: () => value,
      set: (nextValue: number) => {
        // 실제 motion 은 값이 그대로면 change 를 띄우지 않는다
        // (motion-dom MotionValue.updateAndNotify: current !== prev).
        // 이걸 흉내 내지 않으면 초기 스냅 동기화의 같은 값 set 이 알림을 내서,
        // 구독 시점 알림이 없어도 부모가 값을 받은 것처럼 보인다.
        if (Object.is(value, nextValue)) {
          return;
        }

        value = nextValue;
        listeners.forEach((listener) => {
          listener(nextValue);
        });
      },
      on: (event: string, listener: (value: number) => void) => {
        if (event !== "change") {
          return () => {};
        }

        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
  };
  type TestMotionValue = ReturnType<typeof createMotionValue>;
  type TestMotionStyle = Omit<CSSProperties, "height"> & {
    height?: CSSProperties["height"] | TestMotionValue;
  };

  const isMotionValue = (
    value: TestMotionStyle["height"],
  ): value is TestMotionValue =>
    typeof value === "object" && value != null && "get" in value;

  return {
    animate: (motionValue: TestMotionValue, targetValue: number) => {
      animateTargets.push(targetValue);
      motionValue.set(targetValue);
      return { stop: animationStop };
    },
    motion: {
      div: ({
        style,
        ...props
      }: HTMLAttributes<HTMLDivElement> & {
        style?: TestMotionStyle;
      }) => {
        const height = isMotionValue(style?.height)
          ? style.height.get()
          : style?.height;

        return <div style={{ ...style, height }} {...props} />;
      },
    },
    useMotionTemplate: () => "calc(100dvh - 0px)",
    useMotionValue: createMotionValue,
    useTransform: (source: TestMotionValue, transform: (v: number) => string) =>
      transform(source.get()),
  };
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  animateTargets.length = 0;
  animationStop.mockClear();
});

const setScrollableSize = (element: HTMLElement) => {
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: 100,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: 200,
  });
};

const setScrollTop = (element: HTMLElement, value: number) => {
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    value,
  });
};

const dragSheet = ({
  target,
  from,
  to,
}: {
  target: Element | Window;
  from: number;
  to: number;
}) => {
  fireEvent.pointerDown(target, { clientY: from, pointerId: 1 });
  fireEvent.pointerMove(window, { clientY: to, pointerId: 1 });
  fireEvent.pointerUp(window, { clientY: to, pointerId: 1 });
};

describe("shouldStartBottomSheetDrag", () => {
  it("allows dragging from a non-interactive sheet surface", () => {
    const boundary = document.createElement("div");
    const surface = document.createElement("div");
    boundary.append(surface);

    expect(shouldStartBottomSheetDrag(surface, boundary)).toBe(true);
  });

  it("does not start sheet dragging from interactive controls", () => {
    const boundary = document.createElement("div");
    const button = document.createElement("button");
    boundary.append(button);

    expect(shouldStartBottomSheetDrag(button, boundary)).toBe(false);
  });

  it("does not steal gestures from scrollable content", () => {
    const boundary = document.createElement("div");
    const scrollArea = document.createElement("div");
    const row = document.createElement("div");
    scrollArea.style.overflowY = "auto";
    setScrollableSize(scrollArea);
    scrollArea.append(row);
    boundary.append(scrollArea);

    expect(shouldStartBottomSheetDrag(row, boundary)).toBe(false);
  });
});

describe("resolveBottomSheetExpandedProgress", () => {
  it("returns 1 at the top and 0 at the bottom", () => {
    expect(
      resolveBottomSheetExpandedProgress({
        minSnapPoint: 40,
        maxSnapPoint: 720,
        offset: 40,
      }),
    ).toBe(1);
    expect(
      resolveBottomSheetExpandedProgress({
        minSnapPoint: 40,
        maxSnapPoint: 720,
        offset: 720,
      }),
    ).toBe(0);
  });

  it("clamps progress inside the 0 to 1 range", () => {
    expect(
      resolveBottomSheetExpandedProgress({
        minSnapPoint: 40,
        maxSnapPoint: 720,
        offset: -100,
      }),
    ).toBe(1);
    expect(
      resolveBottomSheetExpandedProgress({
        minSnapPoint: 40,
        maxSnapPoint: 720,
        offset: 900,
      }),
    ).toBe(0);
  });
});

describe("resolveBottomSheetNextSnap", () => {
  it("uses the nearest configured snap from the actual release offset", () => {
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 240,
        offsetY: 310,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(480);
  });

  it("does not skip the mini snap when the release point is closer to mini than dismiss", () => {
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 240,
        offsetY: 350,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(480);
  });

  it("uses drag direction to break an exact midpoint tie", () => {
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 240,
        offsetY: 120,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(480);
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 480,
        offsetY: -120,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(240);
  });
});

describe("resolveBottomSheetDragIntent", () => {
  it("keeps a vertical gesture inside scrollable content while the content can scroll", () => {
    const boundary = document.createElement("div");
    const scrollArea = document.createElement("div");
    const row = document.createElement("div");
    scrollArea.style.overflowY = "auto";
    setScrollableSize(scrollArea);
    setScrollTop(scrollArea, 40);
    scrollArea.append(row);
    boundary.append(scrollArea);

    expect(
      resolveBottomSheetDragIntent({
        boundary,
        deltaX: 0,
        deltaY: 24,
        target: row,
      }),
    ).toBe("content");
  });

  it("starts sheet dragging from scrollable content when pulling past the top", () => {
    const boundary = document.createElement("div");
    const scrollArea = document.createElement("div");
    const row = document.createElement("div");
    scrollArea.style.overflowY = "auto";
    setScrollableSize(scrollArea);
    setScrollTop(scrollArea, 0);
    scrollArea.append(row);
    boundary.append(scrollArea);

    expect(
      resolveBottomSheetDragIntent({
        boundary,
        deltaX: 0,
        deltaY: 24,
        target: row,
      }),
    ).toBe("sheet");
  });

  it("keeps horizontal gestures inside content", () => {
    const boundary = document.createElement("div");
    const surface = document.createElement("div");
    boundary.append(surface);

    expect(
      resolveBottomSheetDragIntent({
        boundary,
        deltaX: 24,
        deltaY: 8,
        target: surface,
      }),
    ).toBe("content");
  });
});

describe("DraggableBottomSheet", () => {
  it("마운트 직후 현재 오프셋을 한 번 알려 준다", () => {
    // change 만 듣고 있으면 이 값이 부모에 도달하지 않는다. 초기 스냅 동기화가
    // 돌긴 하지만 이미 같은 값이라 motion 이 알림을 걸러 버린다. 부모는 첫
    // 드래그 전까지 시트 위치를 모르고, 그 값으로 자리를 잡는 지도 컨트롤은
    // 그동안 시트 뒤에 깔린 채 남는다.
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleLiveOffsetChange).toHaveBeenCalled();
    expect(handleLiveOffsetChange.mock.calls[0][0].offset).toBe(120);
  });

  it("마운트 슬라이드 중에는 진행도를 0 에서 시작해 함께 알린다", () => {
    // offset 은 첫 프레임부터 최종 스냅 값이라 시트가 어디까지 올라왔는지 모른다.
    // 시트 윗변에 붙어 다니는 요소가 허공에 뜨지 않으려면 이 값이 필요하다.
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        animateOnMount
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleLiveOffsetChange.mock.calls[0][0].mountProgress).toBe(0);
    // 슬라이드가 끝나면 1 로 올라온다(mock 의 animate 는 즉시 목표값을 넣는다).
    expect(handleLiveOffsetChange.mock.calls.at(-1)?.[0].mountProgress).toBe(1);
  });

  it("마운트 애니메이션이 없으면 진행도가 처음부터 1 이다", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleLiveOffsetChange.mock.calls[0][0].mountProgress).toBe(1);
  });

  it("스냅 애니메이션이 시작되면 안착 전까지 isSettled 가 false 다", () => {
    // settleToSnapPoint 는 스프링을 시작하자마자 onSnapChange 를 부른다. 단계로만
    // 위치를 정하면 시트가 아직 움직이는 중에 따라다니는 요소가 먼저 튄다.
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        maxSnapPoint={600}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleLiveOffsetChange.mock.calls[0][0].isSettled).toBe(true);
    handleLiveOffsetChange.mockClear();

    // 목표와 다른 오프셋이 흘러 들어오는 동안은 아직 안착이 아니다.
    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 300, pointerId: 1 });

    expect(handleLiveOffsetChange.mock.calls.at(-1)?.[0].isSettled).toBe(false);
  });

  it("updates live offset from a non-interactive sheet surface", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    const lastState = handleLiveOffsetChange.mock.calls.at(-1)?.[0];

    expect(lastState.offset).toBe(240);
  });

  it("keeps interactive controls clickable instead of starting sheet dragging", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <button type="button">Share</button>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Share" }), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    expect(handleLiveOffsetChange).not.toHaveBeenCalled();
  });

  it("ignores secondary pointer buttons when starting sheet dragging", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      button: 2,
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    expect(handleLiveOffsetChange).not.toHaveBeenCalled();
  });

  it("keeps scrollable content gestures inside the content while it can scroll", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="scroll-area" style={{ overflowY: "auto" }}>
          <div data-testid="scroll-row">scroll row</div>
        </div>
      </DraggableBottomSheet>,
    );

    setScrollableSize(screen.getByTestId("scroll-area"));
    setScrollTop(screen.getByTestId("scroll-area"), 40);
    handleLiveOffsetChange.mockClear();
    fireEvent.pointerDown(screen.getByTestId("scroll-row"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    expect(handleLiveOffsetChange).not.toHaveBeenCalled();
  });

  it("starts sheet dragging from scrollable content at its edge", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        snapPoint={120}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="scroll-area" style={{ overflowY: "auto" }}>
          <div data-testid="scroll-row">scroll row</div>
        </div>
      </DraggableBottomSheet>,
    );

    setScrollableSize(screen.getByTestId("scroll-area"));
    setScrollTop(screen.getByTestId("scroll-area"), 0);
    handleLiveOffsetChange.mockClear();
    fireEvent.pointerDown(screen.getByTestId("scroll-row"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    expect(handleLiveOffsetChange).toHaveBeenCalled();
  });

  it("settles by animating the offset to a configured snap", () => {
    render(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragSheet({
      target: screen.getByTestId("sheet-surface"),
      from: 0,
      to: 120,
    });

    expect(animateTargets.at(-1)).toBe(480);
  });

  it("uses the mini snap between half and dismiss", () => {
    const handleSnapChange = vi.fn();

    render(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        onSnapChange={handleSnapChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragSheet({
      target: screen.getByTestId("sheet-surface"),
      from: 0,
      to: 120,
    });

    expect(handleSnapChange).toHaveBeenCalledWith(480);
  });

  it("settles to an external snap request", () => {
    const handleSnapChange = vi.fn();

    const { rerender } = render(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        onSnapChange={handleSnapChange}
      >
        <div>sheet surface</div>
      </DraggableBottomSheet>,
    );

    rerender(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        snapRequest={{ id: 1, snapPoint: 480 }}
        onSnapChange={handleSnapChange}
      >
        <div>sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(animateTargets.at(-1)).toBe(480);
    expect(handleSnapChange).toHaveBeenLastCalledWith(480);
  });

  it("does not replay an already consumed snap request after remounting", () => {
    const handleSnapChange = vi.fn();
    const snapRequest = { id: 1, snapPoint: 480 };
    const renderSheet = (
      sheetKey: string,
      request: typeof snapRequest | null,
    ) => (
      <DraggableBottomSheet
        key={sheetKey}
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        snapRequest={request}
        onSnapChange={handleSnapChange}
      >
        <div>sheet surface</div>
      </DraggableBottomSheet>
    );

    const { rerender } = render(renderSheet("locker-1", null));
    rerender(renderSheet("locker-1", snapRequest));

    expect(animateTargets.at(-1)).toBe(480);

    // 다른 보관함으로 교체되어 시트가 리마운트된다. 부모가 아직 들고 있는 과거
    // 요청을 다시 재생하면 새 시트가 기본 스냅 대신 직전 단계로 열린다.
    animateTargets.length = 0;
    handleSnapChange.mockClear();
    rerender(renderSheet("locker-2", snapRequest));

    expect(animateTargets).toEqual([]);
    expect(handleSnapChange).not.toHaveBeenCalled();
  });

  it("still settles to a snap request that arrives after remounting", () => {
    const handleSnapChange = vi.fn();
    const renderSheet = (
      sheetKey: string,
      request: { id: number; snapPoint: number } | null,
    ) => (
      <DraggableBottomSheet
        key={sheetKey}
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        snapRequest={request}
        onSnapChange={handleSnapChange}
      >
        <div>sheet surface</div>
      </DraggableBottomSheet>
    );

    const { rerender } = render(
      renderSheet("locker-1", { id: 1, snapPoint: 480 }),
    );
    rerender(renderSheet("locker-2", { id: 1, snapPoint: 480 }));

    animateTargets.length = 0;
    rerender(renderSheet("locker-2", { id: 2, snapPoint: 40 }));

    expect(animateTargets.at(-1)).toBe(40);
    expect(handleSnapChange).toHaveBeenLastCalledWith(40);
  });

  it("reports live offset changes while dragging", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 120, pointerId: 1 });

    const lastState = handleLiveOffsetChange.mock.calls.at(-1)?.[0];

    expect(lastState.offset).toBe(360);
    expect(lastState.expandedProgress).toBeCloseTo(0.529, 3);
    expect(lastState.snapPoints).toEqual([40, 240, 480, 720]);
  });

  it("applies drag sensitivity to live dragging", () => {
    const handleLiveOffsetChange = vi.fn();

    render(
      <DraggableBottomSheet
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        dragSensitivity={1.2}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 120, pointerId: 1 });

    const lastState = handleLiveOffsetChange.mock.calls.at(-1)?.[0];

    expect(lastState.offset).toBe(384);
  });

  it("re-clamps the current offset when snap bounds change", () => {
    const handleLiveOffsetChange = vi.fn();
    const { rerender } = render(
      <DraggableBottomSheet
        initialSnapPoint={720}
        minSnapPoint={40}
        snapPoint={240}
        maxSnapPoint={720}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );
    handleLiveOffsetChange.mockClear();

    rerender(
      <DraggableBottomSheet
        initialSnapPoint={720}
        minSnapPoint={40}
        snapPoint={240}
        maxSnapPoint={500}
        onLiveOffsetChange={handleLiveOffsetChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    const lastState = handleLiveOffsetChange.mock.calls.at(-1)?.[0];

    expect(lastState.offset).toBe(500);
  });

  it("calls onDismiss when the sheet reaches the dismiss snap", () => {
    const handleDismiss = vi.fn();
    const handleSnapChange = vi.fn();

    render(
      <DraggableBottomSheet
        initialSnapPoint={480}
        minSnapPoint={40}
        snapPoint={240}
        miniSnapPoint={480}
        maxSnapPoint={720}
        onDismiss={handleDismiss}
        onSnapChange={handleSnapChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragSheet({
      target: screen.getByTestId("sheet-surface"),
      from: 0,
      to: 120,
    });

    expect(handleSnapChange).toHaveBeenCalledWith(720);
    expect(handleDismiss).toHaveBeenCalledOnce();
  });
});
