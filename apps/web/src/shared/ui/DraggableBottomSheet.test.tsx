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

vi.mock("motion/react", async () => {
  // 실제 useMotionValue 는 렌더가 다시 돌아도 같은 값을 돌려준다. 렌더마다 새로
  // 만들면 이 값을 의존성에 둔 이펙트가 매 렌더 다시 돌아, 프로덕션에서는 한 번만
  // 도는 동기화가 테스트에서만 여러 번 돌며 어긋난 상태를 덮어 준다.
  const { useRef } = await import("react");
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
    animate: (
      motionValue: TestMotionValue,
      targetValue: number,
      options?: { onComplete?: () => void },
    ) => {
      animateTargets.push(targetValue);
      motionValue.set(targetValue);
      // 실제 motion 은 애니메이션이 끝나면 onComplete 를 부른다. 흉내 내지
      // 않으면 그 안에서만 도는 코드가 테스트에서 아예 실행되지 않는다.
      options?.onComplete?.();
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
    useMotionValue: (initial: number) => {
      const ref = useRef<TestMotionValue | null>(null);
      if (ref.current == null) {
        ref.current = createMotionValue(initial);
      }

      return ref.current;
    },
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
  it("누를 것이 없는 시트 표면에서는 드래그를 시작한다", () => {
    const boundary = document.createElement("div");
    const surface = document.createElement("div");
    boundary.append(surface);

    expect(shouldStartBottomSheetDrag(surface, boundary)).toBe(true);
  });

  it("누를 수 있는 컨트롤에서는 시트를 끌지 않는다", () => {
    const boundary = document.createElement("div");
    const button = document.createElement("button");
    boundary.append(button);

    expect(shouldStartBottomSheetDrag(button, boundary)).toBe(false);
  });

  it("스크롤되는 콘텐츠의 제스처를 가로채지 않는다", () => {
    const boundary = document.createElement("div");
    const scrollArea = document.createElement("div");
    const row = document.createElement("div");
    scrollArea.style.overflowY = "auto";
    setScrollableSize(scrollArea);
    scrollArea.append(row);
    boundary.append(scrollArea);

    expect(shouldStartBottomSheetDrag(row, boundary)).toBe(false);
  });

  it("시트 밖으로 포털된 오버레이에서는 시트를 끌지 않는다", () => {
    const boundary = document.createElement("div");
    // 포털로 띄운 모달은 DOM 상 시트 밖이지만 React 트리를 따라 이벤트가 올라온다.
    const overlay = document.createElement("div");
    const image = document.createElement("div");
    overlay.append(image);
    document.body.append(boundary, overlay);

    expect(shouldStartBottomSheetDrag(image, boundary)).toBe(false);

    boundary.remove();
    overlay.remove();
  });
});

describe("resolveBottomSheetExpandedProgress", () => {
  it("맨 위에서 1, 맨 아래에서 0 을 준다", () => {
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

  it("진행도를 0 과 1 사이로 가둔다", () => {
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
  it("손을 뗀 실제 위치에서 가장 가까운 스냅을 고른다", () => {
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 240,
        offsetY: 310,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(480);
  });

  it("미니가 더 가까우면 미니를 건너뛰고 dismiss 로 가지 않는다", () => {
    expect(
      resolveBottomSheetNextSnap({
        startSnap: 240,
        offsetY: 350,
        snapPoints: [40, 240, 480, 720],
      }),
    ).toBe(480);
  });

  it("정확히 가운데면 끌던 방향으로 가른다", () => {
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
  it("콘텐츠가 더 스크롤될 수 있으면 세로 제스처를 콘텐츠에 남긴다", () => {
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

  it("콘텐츠 맨 위에서 더 당기면 시트를 끌기 시작한다", () => {
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

  it("가로 제스처는 콘텐츠에 남긴다", () => {
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
  it("full 경계가 움직여 시트를 옮기면 그 자리를 알려 준다", () => {
    // 안 알리면 부모는 옛 단계를 그대로 들고 있는다. full 이 사라져 시트가 half 로
    // 내려앉아도 단계는 full 로 남아, "half 일 때만" 인 규칙이 걸리지 않는다.
    const handleSnapChange = vi.fn();
    const { rerender } = render(
      <DraggableBottomSheet
        minSnapPoint={112}
        snapPoint={471}
        maxSnapPoint={760}
        initialSnapPoint={112}
        onSnapChange={handleSnapChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    handleSnapChange.mockClear();

    // 결과가 줄어 full 이 사라지고 half 가 시트의 끝을 맡는다.
    rerender(
      <DraggableBottomSheet
        minSnapPoint={471}
        snapPoint={471}
        maxSnapPoint={760}
        initialSnapPoint={112}
        onSnapChange={handleSnapChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleSnapChange).toHaveBeenCalledWith(471);
  });

  it("full 로 날아가는 중에 경계가 바뀌면 순간이동하지 않고 목표만 바꾼다", () => {
    // settleToSnapPoint 는 스프링을 시작하면서 목표값을 미리 적어 둔다. 그래서
    // 날아가는 도중에 경계가 다시 계산되면 "이미 full 에 앉아 있다" 로 읽힌다.
    // 그때 오프셋을 바로 써 버리면 가던 시트가 툭 튄다.
    const handleSnapChange = vi.fn();
    const renderSheet = (minSnapPoint: number) => (
      <DraggableBottomSheet
        minSnapPoint={minSnapPoint}
        snapPoint={500}
        maxSnapPoint={760}
        onSnapChange={handleSnapChange}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>
    );

    const { rerender } = render(renderSheet(300));

    dragSheet({
      target: screen.getByTestId("sheet-surface"),
      from: 200,
      to: 0,
    });
    expect(animateTargets.at(-1)).toBe(300);

    animateTargets.length = 0;
    handleSnapChange.mockClear();

    // full 콘텐츠가 늘어 경계가 더 위로 올라간다.
    rerender(renderSheet(200));

    expect(animateTargets).toEqual([200]);
    expect(handleSnapChange).toHaveBeenLastCalledWith(200);
  });

  it("경계를 따라간 뒤에는 사용자가 옮겨 둔 자리를 지킨다", () => {
    // 화면 높이가 바뀌면 경계와 기본 half 가 함께 움직인다. 따라가는 길에서 그 half 를
    // 처리한 것으로 적지 않으면, 사용자가 mini 로 내려 둔 뒤 경계가 다시 계산될 때
    // 초기 스냅 요청으로 읽혀 시트를 half 로 끌어올린다.
    const handleSnapChange = vi.fn();
    const renderSheet = (props: {
      minSnapPoint: number;
      snapPoint: number;
      miniSnapPoint: number;
      snapRequest?: { id: number; snapPoint: number };
    }) => (
      <DraggableBottomSheet
        maxSnapPoint={760}
        initialSnapPoint={props.snapPoint}
        onSnapChange={handleSnapChange}
        {...props}
      >
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>
    );

    const { rerender } = render(
      renderSheet({ minSnapPoint: 300, snapPoint: 471, miniSnapPoint: 633 }),
    );

    // 사용자가 full 로 올린다.
    dragSheet({
      target: screen.getByTestId("sheet-surface"),
      from: 200,
      to: 0,
    });
    expect(animateTargets.at(-1)).toBe(300);

    // 화면이 줄어 경계와 기본 half 가 함께 내려온다. 시트는 경계를 따라간다.
    rerender(
      renderSheet({ minSnapPoint: 340, snapPoint: 500, miniSnapPoint: 650 }),
    );
    expect(animateTargets.at(-1)).toBe(340);

    // 사용자가 mini 로 내려 둔다.
    rerender(
      renderSheet({
        minSnapPoint: 340,
        snapPoint: 500,
        miniSnapPoint: 650,
        snapRequest: { id: 1, snapPoint: 650 },
      }),
    );
    expect(animateTargets.at(-1)).toBe(650);

    animateTargets.length = 0;
    handleSnapChange.mockClear();

    // 결과가 바뀌어 경계만 다시 계산된다.
    rerender(
      renderSheet({
        minSnapPoint: 300,
        snapPoint: 500,
        miniSnapPoint: 650,
        snapRequest: { id: 1, snapPoint: 650 },
      }),
    );

    expect(animateTargets).toEqual([]);
    expect(handleSnapChange).not.toHaveBeenCalled();
  });

  it("마운트 때는 자리가 그대로라 알리지 않는다", () => {
    const handleSnapChange = vi.fn();

    render(
      <DraggableBottomSheet snapPoint={120} onSnapChange={handleSnapChange}>
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    expect(handleSnapChange).not.toHaveBeenCalled();
  });

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

  it("놓은 자리가 이미 스냅 지점이어도 안착을 알린다", () => {
    // 드래그를 스냅 지점에서 놓으면 애니메이션이 곧바로 끝난다. 그때 onComplete
    // 의 set 은 값이 그대로라 change 가 나가지 않으므로, 따로 알리지 않으면
    // 부모는 드래그 중에 받은 "아직 안착 전" 을 마지막 상태로 들고 있게 된다.
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

    // 스냅 지점(120)에 정확히 놓는다. 드래그로 오프셋을 한 번 움직였다가
    // 제자리로 돌려놓아야, 놓는 순간 animate 의 목표가 현재 값과 같아진다.
    fireEvent.pointerDown(screen.getByTestId("sheet-surface"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(window, { clientY: 120, pointerId: 1 });
    handleLiveOffsetChange.mockClear();
    fireEvent.pointerUp(window, { clientY: 120, pointerId: 1 });

    const last = handleLiveOffsetChange.mock.calls.at(-1)?.[0];

    expect(last?.isSettled).toBe(true);
  });

  it("누를 것이 없는 표면에서 끌면 라이브 오프셋을 갱신한다", () => {
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

  it("누를 수 있는 컨트롤은 시트를 끌지 않고 눌리게 둔다", () => {
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

  it("주 버튼이 아닌 포인터로는 시트를 끌지 않는다", () => {
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

  it("더 스크롤될 수 있으면 콘텐츠의 제스처를 콘텐츠에 남긴다", () => {
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

  it("콘텐츠가 끝에 닿으면 시트를 끌기 시작한다", () => {
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

  it("정해진 스냅까지 오프셋을 움직여 안착시킨다", () => {
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

  it("하프와 dismiss 사이에서는 미니를 쓴다", () => {
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

  it("밖에서 온 스냅 요청 자리로 안착한다", () => {
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

  it("리마운트해도 이미 처리한 스냅 요청을 다시 재생하지 않는다", () => {
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

  it("리마운트 뒤에 온 스냅 요청에는 안착한다", () => {
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

  it("끄는 동안 라이브 오프셋 변화를 알린다", () => {
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

  it("끄는 동안 드래그 감도를 반영한다", () => {
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

  it("스냅 경계가 바뀌면 현재 오프셋을 다시 가둔다", () => {
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

  it("시트가 dismiss 자리에 닿으면 onDismiss 를 부른다", () => {
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
