import { fireEvent, render, screen } from "@testing-library/react";
import type { HTMLAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
  shouldStartBottomSheetDrag,
} from "./DraggableBottomSheet";

const { animationStart, dragHandlers, dragStart } = vi.hoisted(() => ({
  animationStart: vi.fn(),
  dragHandlers: {
    onDrag: undefined as
      | ((event: unknown, info: { offset: { y: number } }) => void)
      | undefined,
    onDragEnd: undefined as
      | ((
          event: unknown,
          info: { offset: { y: number }; velocity: { y: number } },
        ) => void)
      | undefined,
    onDragStart: undefined as (() => void) | undefined,
  },
  dragStart: vi.fn(),
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      animate: _animate,
      drag: _drag,
      dragConstraints: _dragConstraints,
      dragControls: _dragControls,
      dragElastic: _dragElastic,
      dragListener: _dragListener,
      dragMomentum: _dragMomentum,
      exit: _exit,
      initial: _initial,
      onDrag,
      onDragEnd,
      onDragStart,
      transition: _transition,
      ...props
    }: HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      (() => {
        dragHandlers.onDrag = onDrag as typeof dragHandlers.onDrag;
        dragHandlers.onDragEnd = onDragEnd as typeof dragHandlers.onDragEnd;
        dragHandlers.onDragStart =
          onDragStart as typeof dragHandlers.onDragStart;

        return <div {...props} />;
      })(),
  },
  useAnimation: () => ({ start: animationStart }),
  useDragControls: () => ({ start: dragStart }),
}));

afterEach(() => {
  document.body.innerHTML = "";
  animationStart.mockClear();
  dragHandlers.onDrag = undefined;
  dragHandlers.onDragEnd = undefined;
  dragHandlers.onDragStart = undefined;
  dragStart.mockClear();
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
  it("starts dragging from a non-interactive sheet surface", () => {
    render(
      <DraggableBottomSheet snapPoint={120}>
        <div data-testid="sheet-surface">sheet surface</div>
      </DraggableBottomSheet>,
    );

    fireEvent.pointerDown(screen.getByTestId("sheet-surface"));

    expect(dragStart).toHaveBeenCalledOnce();
  });

  it("keeps interactive controls clickable instead of starting sheet dragging", () => {
    render(
      <DraggableBottomSheet snapPoint={120}>
        <button type="button">Share</button>
      </DraggableBottomSheet>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Share" }));

    expect(dragStart).not.toHaveBeenCalled();
  });

  it("keeps scrollable content gestures inside the content", () => {
    render(
      <DraggableBottomSheet snapPoint={120}>
        <div data-testid="scroll-area" style={{ overflowY: "auto" }}>
          <div data-testid="scroll-row">scroll row</div>
        </div>
      </DraggableBottomSheet>,
    );

    setScrollableSize(screen.getByTestId("scroll-area"));
    fireEvent.pointerDown(screen.getByTestId("scroll-row"));

    expect(dragStart).not.toHaveBeenCalled();
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
        <div>sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragHandlers.onDragStart?.();
    dragHandlers.onDragEnd?.(null, {
      offset: { y: 120 },
      velocity: { y: 0 },
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
        <div>sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragHandlers.onDragStart?.();
    dragHandlers.onDrag?.(null, {
      offset: { y: 120 },
    });

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
        <div>sheet surface</div>
      </DraggableBottomSheet>,
    );

    dragHandlers.onDragStart?.();
    dragHandlers.onDragEnd?.(null, {
      offset: { y: 120 },
      velocity: { y: 0 },
    });

    expect(handleSnapChange).toHaveBeenCalledWith(720);
    expect(handleDismiss).toHaveBeenCalledOnce();
  });
});
