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
