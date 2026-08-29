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

  it("끝에 닿아 버튼이 비활성화되면 반대쪽 버튼으로 포커스를 옮긴다", () => {
    const { dialog } = renderGallery();
    const previousButton = within(dialog).getByRole("button", {
      name: "이전 사진",
    });
    const nextButton = within(dialog).getByRole("button", {
      name: "다음 사진",
    });

    nextButton.focus();
    fireEvent.click(nextButton);
    expect(nextButton.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(previousButton);

    fireEvent.click(previousButton);
    fireEvent.click(previousButton);
    expect(previousButton.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(nextButton);
  });

  it("방향키로 끝에 닿을 때도 포커스를 반대쪽으로 옮긴다", () => {
    const { dialog } = renderGallery();
    const previousButton = within(dialog).getByRole("button", {
      name: "이전 사진",
    });
    const nextButton = within(dialog).getByRole("button", {
      name: "다음 사진",
    });

    nextButton.focus();
    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(nextButton.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(previousButton);
  });

  it("버튼에 포커스가 없으면 이동해도 포커스를 빼앗지 않는다", () => {
    const { dialog } = renderGallery();
    const closeButton = within(dialog).getByRole("button", { name: "닫기" });

    closeButton.focus();
    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(document.activeElement).toBe(closeButton);
  });

  it("재조회로 앞에 사진이 끼어도 보고 있던 사진을 그대로 둔다", () => {
    const { rerender } = render(
      <OriginalImagePreview
        images={GALLERY}
        initialIndex={1}
        alt="원본 사진"
        closeLabel="닫기"
        onClose={vi.fn()}
      />,
    );

    const getSrc = () =>
      within(screen.getByRole("dialog", { name: "원본 사진" }))
        .getByRole("img")
        .getAttribute("src");

    expect(getSrc()).toBe("https://example.com/b.jpg");

    rerender(
      <OriginalImagePreview
        images={["https://example.com/new.jpg", ...GALLERY]}
        initialIndex={1}
        alt="원본 사진"
        closeLabel="닫기"
        onClose={vi.fn()}
      />,
    );

    expect(getSrc()).toBe("https://example.com/b.jpg");
    expect(
      screen.getByRole("dialog", { name: "원본 사진" }).textContent,
    ).toContain("3 / 4");
  });

  it("목록이 비면 닫기 콜백을 부른다", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <OriginalImagePreview
        images={GALLERY}
        alt="원본 사진"
        closeLabel="닫기"
        onClose={handleClose}
      />,
    );

    rerender(
      <OriginalImagePreview
        images={[]}
        alt="원본 사진"
        closeLabel="닫기"
        onClose={handleClose}
      />,
    );

    expect(handleClose).toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "원본 사진" })).toBeNull();
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
