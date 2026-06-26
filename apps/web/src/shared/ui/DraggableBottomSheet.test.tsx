import { fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties, HTMLAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
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

  it("keeps scrollable content gestures inside the content", () => {
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
    handleLiveOffsetChange.mockClear();
    fireEvent.pointerDown(screen.getByTestId("scroll-row"), {
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { clientY: 240, pointerId: 1 });

    expect(handleLiveOffsetChange).not.toHaveBeenCalled();
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
