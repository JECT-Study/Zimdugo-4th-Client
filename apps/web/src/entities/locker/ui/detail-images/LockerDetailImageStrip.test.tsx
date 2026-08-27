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
      Reflect.deleteProperty(HTMLImageElement.prototype, "complete");
      Reflect.deleteProperty(HTMLImageElement.prototype, "naturalWidth");
    }
  });

  it("이미지가 한 장뿐이면 인디케이터를 두지 않는다", () => {
    const { container } = render(
      <LockerDetailImageStrip images={[IMAGES[0]]} />,
    );

    expect(getImageButtons()).toHaveLength(1);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("로드에 실패한 이미지는 목록에서 빼고 나머지는 그대로 보여 준다", () => {
    render(<LockerDetailImageStrip images={IMAGES} />);

    const firstImage = document.querySelector("img");
    if (!firstImage) {
      throw new Error("이미지가 렌더링되지 않았다");
    }
    fireEvent.error(firstImage);

    const buttons = getImageButtons();
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute("aria-label")).toBe("보관함 사진 1 / 2");
    expect(getRenderedImages()).not.toContain("https://example.com/a.jpg");
  });

  it("모든 이미지가 실패하면 섹션 자체를 렌더링하지 않는다", () => {
    const { container } = render(
      <LockerDetailImageStrip images={[IMAGES[0]]} />,
    );

    const onlyImage = document.querySelector("img");
    if (!onlyImage) {
      throw new Error("이미지가 렌더링되지 않았다");
    }
    fireEvent.error(onlyImage);

    expect(container.firstChild).toBeNull();
  });

  it("사진을 누르면 살아 있는 목록과 그 안에서의 위치를 넘긴다", () => {
    const onOpenPreview = vi.fn();
    render(
      <LockerDetailImageStrip images={IMAGES} onOpenPreview={onOpenPreview} />,
    );

    const firstImage = document.querySelector("img");
    if (!firstImage) {
      throw new Error("이미지가 렌더링되지 않았다");
    }
    fireEvent.error(firstImage);
    fireEvent.click(getImageButtons()[0]);

    expect(onOpenPreview).toHaveBeenCalledWith(
      ["https://example.com/b.jpg", "https://example.com/c.jpg"],
      0,
      getImageButtons()[0],
    );
  });
});
