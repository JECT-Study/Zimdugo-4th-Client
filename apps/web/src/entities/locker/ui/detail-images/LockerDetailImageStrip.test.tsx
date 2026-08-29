// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { LockerDetailImageStrip } from "./LockerDetailImageStrip";

const IMAGES = [
  "https://example.com/a.jpg",
  "https://example.com/b.jpg",
  "https://example.com/c.jpg",
];

const getImageButtons = () =>
  screen.queryAllByRole("button", { name: /보관함 사진/ });

const getRenderedImages = () =>
  Array.from(document.querySelectorAll("img")).map((image) =>
    image.getAttribute("src"),
  );

const restoreDescriptor = (
  property: "complete" | "naturalWidth",
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) {
    Object.defineProperty(HTMLImageElement.prototype, property, descriptor);
    return;
  }

  Reflect.deleteProperty(HTMLImageElement.prototype, property);
};

describe("LockerDetailImageStrip", () => {
  beforeEach(() => {
    setTestLanguage("ko");
  });

  afterEach(() => {
    cleanup();
  });

  it("이미지 개수만큼 사진 버튼을 렌더링한다", () => {
    render(<LockerDetailImageStrip images={IMAGES} />);

    const buttons = getImageButtons();
    expect(buttons).toHaveLength(3);
    expect(buttons[0]?.getAttribute("aria-label")).toBe("보관함 사진 1 / 3");
    expect(buttons[2]?.getAttribute("aria-label")).toBe("보관함 사진 3 / 3");
  });

  it("현재 장과 다음 한 장까지만 실제로 내려받는다", () => {
    render(<LockerDetailImageStrip images={IMAGES} />);

    expect(getRenderedImages()).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/b.jpg",
    ]);
  });

  it("이미 로드가 끝난 이미지를 만나도 렌더 루프에 빠지지 않는다", () => {
    // jsdom 은 이미지를 실제로 받지 않아 complete 가 늘 false 다.
    // 캐시 적중처럼 보이게 만들어 ref 콜백이 로드 완료를 알리는 경로를 태운다.
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "complete",
    );
    const naturalWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "naturalWidth",
    );

    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 100,
    });

    try {
      expect(() =>
        render(<LockerDetailImageStrip images={IMAGES} />),
      ).not.toThrow();
      expect(getImageButtons()).toHaveLength(3);
    } finally {
      // jsdom 의 원래 구현을 지우면 뒤따르는 테스트가 망가진다. 디스크립터를 되돌린다.
      restoreDescriptor("complete", completeDescriptor);
      restoreDescriptor("naturalWidth", naturalWidthDescriptor);
    }
  });

  it("핸들러가 붙기 전에 이미 실패한 이미지도 실패로 표시한다", () => {
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "complete",
    );
    const naturalWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "naturalWidth",
    );

    // 캐시에서 곧바로 실패한 상태: 요청은 끝났는데(complete) 그려진 게 없다.
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 0,
    });

    try {
      render(<LockerDetailImageStrip images={[IMAGES[0]]} />);

      expect(screen.getByText("사진을 불러오지 못했어요")).toBeTruthy();
      expect(getImageButtons()).toHaveLength(0);
    } finally {
      restoreDescriptor("complete", completeDescriptor);
      restoreDescriptor("naturalWidth", naturalWidthDescriptor);
    }
  });

  it("포커스를 쥔 사진이 실패하면 남은 사진으로 포커스를 옮긴다", () => {
    render(<LockerDetailImageStrip images={IMAGES} />);

    const buttons = getImageButtons();
    buttons[0].focus();
    fireEvent.error(buttons[0].querySelector("img") as HTMLImageElement);

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "보관함 사진 2 / 3" }),
    );
  });

  it("이미지가 한 장뿐이면 인디케이터를 두지 않는다", () => {
    const { container } = render(
      <LockerDetailImageStrip images={[IMAGES[0]]} />,
    );

    expect(getImageButtons()).toHaveLength(1);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("로드에 실패해도 자리를 지키고 실패 문구를 보여 준다", () => {
    render(<LockerDetailImageStrip images={IMAGES} />);

    const firstImage = document.querySelector("img");
    if (!firstImage) {
      throw new Error("이미지가 렌더링되지 않았다");
    }
    fireEvent.error(firstImage);

    // 목록 길이와 나머지 사진의 번호는 그대로다.
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("사진을 불러오지 못했어요")).toBeTruthy();
    expect(getImageButtons()[0]?.getAttribute("aria-label")).toBe(
      "보관함 사진 2 / 3",
    );
  });

  it("실패한 사진은 눌러도 미리보기가 열리지 않는다", () => {
    const onOpenPreview = vi.fn();
    render(
      <LockerDetailImageStrip images={IMAGES} onOpenPreview={onOpenPreview} />,
    );

    const firstImage = document.querySelector("img");
    if (!firstImage) {
      throw new Error("이미지가 렌더링되지 않았다");
    }
    fireEvent.error(firstImage);

    expect(
      screen.queryByRole("button", { name: "보관함 사진 1 / 3" }),
    ).toBeNull();
  });

  it("보여 줄 이미지가 없으면 섹션 자체를 렌더링하지 않는다", () => {
    const { container } = render(<LockerDetailImageStrip images={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("빈 목록으로 먼저 그려졌다가 사진이 도착해도 끌기 리스너가 붙는다", () => {
    const { rerender } = render(<LockerDetailImageStrip images={[]} />);

    rerender(<LockerDetailImageStrip images={IMAGES} />);

    const strip = document.querySelector("ul");
    expect(strip).not.toBeNull();

    // 기본 끌기를 막는 것은 훅이 붙었을 때만 일어난다.
    const dragStart = new Event("dragstart", {
      bubbles: true,
      cancelable: true,
    });
    strip?.dispatchEvent(dragStart);

    expect(dragStart.defaultPrevented).toBe(true);
  });

  it("사진을 누르면 위치와 누른 버튼을 넘긴다", () => {
    const onOpenPreview = vi.fn();
    render(
      <LockerDetailImageStrip images={IMAGES} onOpenPreview={onOpenPreview} />,
    );

    const buttons = getImageButtons();
    fireEvent.click(buttons[1]);

    expect(onOpenPreview).toHaveBeenCalledWith(1, buttons[1]);
  });

  it("끌지 않고 눌렀다 떼면 미리보기가 열린다", () => {
    const onOpenPreview = vi.fn();
    render(
      <LockerDetailImageStrip images={IMAGES} onOpenPreview={onOpenPreview} />,
    );

    const button = getImageButtons()[1];

    // 끌기 훅이 포인터를 가로채면 이 클릭이 사진 버튼까지 오지 않는다.
    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 100 });
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 100 });
    fireEvent.click(button);

    expect(onOpenPreview).toHaveBeenCalledWith(1, button);
  });
});
