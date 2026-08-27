// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OriginalImagePreview } from "./OriginalImagePreview";

describe("OriginalImagePreview", () => {
  afterEach(cleanup);

  it("지정한 모달 컨테이너 안에 미리보기를 렌더링하고 닫는다", () => {
    const portalContainer = document.createElement("div");
    const handleClose = vi.fn();
    document.body.append(portalContainer);

    render(
      <OriginalImagePreview
        images={["https://example.com/original.jpg"]}
        alt="원본 사진"
        closeLabel="닫기"
        portalContainer={portalContainer}
        onClose={handleClose}
      />,
    );

    const dialog = within(portalContainer).getByRole("dialog", {
      name: "원본 사진",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

    expect(handleClose).toHaveBeenCalledOnce();
    portalContainer.remove();
  });

  const GALLERY = [
    "https://example.com/a.jpg",
    "https://example.com/b.jpg",
    "https://example.com/c.jpg",
  ];

  const renderGallery = (onClose = vi.fn()) => {
    render(
      <OriginalImagePreview
        images={GALLERY}
        initialIndex={1}
        alt="원본 사진"
        closeLabel="닫기"
        navigationLabels={{ previous: "이전 사진", next: "다음 사진" }}
        onClose={onClose}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "원본 사진" });

    return {
      dialog,
      getSrc: () => within(dialog).getByRole("img").getAttribute("src"),
    };
  };

  it("여러 장이면 좌우 버튼과 위치 카운터를 보여 준다", () => {
    const { dialog, getSrc } = renderGallery();

    expect(getSrc()).toBe("https://example.com/b.jpg");
    expect(dialog.textContent).toContain("2 / 3");

    fireEvent.click(within(dialog).getByRole("button", { name: "다음 사진" }));
    expect(getSrc()).toBe("https://example.com/c.jpg");

    fireEvent.click(within(dialog).getByRole("button", { name: "이전 사진" }));
    expect(getSrc()).toBe("https://example.com/b.jpg");
  });

  it("양 끝에서는 더 넘길 수 없다", () => {
    const { dialog, getSrc } = renderGallery();

    fireEvent.click(within(dialog).getByRole("button", { name: "이전 사진" }));
    expect(getSrc()).toBe("https://example.com/a.jpg");
    expect(
      within(dialog)
        .getByRole("button", { name: "이전 사진" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("방향키로도 사진을 넘긴다", () => {
    const { getSrc } = renderGallery();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(getSrc()).toBe("https://example.com/c.jpg");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(getSrc()).toBe("https://example.com/b.jpg");
  });

  it("사진이 깨져도 자리를 지키고 실패 문구를 보여 준다", () => {
    render(
      <OriginalImagePreview
        images={GALLERY}
        initialIndex={1}
        alt="원본 사진"
        closeLabel="닫기"
        loadFailedLabel="사진을 불러오지 못했어요"
        navigationLabels={{ previous: "이전 사진", next: "다음 사진" }}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "원본 사진" });
    fireEvent.error(within(dialog).getByRole("img"));

    expect(within(dialog).queryByRole("img")).toBeNull();
    expect(within(dialog).getByText("사진을 불러오지 못했어요")).toBeTruthy();
    // 위치와 카운터는 그대로다.
    expect(dialog.textContent).toContain("2 / 3");

    fireEvent.click(within(dialog).getByRole("button", { name: "다음 사진" }));
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe(
      "https://example.com/c.jpg",
    );
  });

  it("한 장뿐이면 좌우 버튼과 카운터를 두지 않는다", () => {
    render(
      <OriginalImagePreview
        images={["https://example.com/a.jpg"]}
        alt="원본 사진"
        closeLabel="닫기"
        navigationLabels={{ previous: "이전 사진", next: "다음 사진" }}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "원본 사진" });
    expect(
      within(dialog).queryByRole("button", { name: "다음 사진" }),
    ).toBeNull();
    expect(dialog.textContent).not.toContain("1 / 1");
  });
});
