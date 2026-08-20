// @vitest-environment jsdom

import { cleanup, fireEvent, render, within } from "@testing-library/react";
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
        imageUrl="https://example.com/original.jpg"
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
});
