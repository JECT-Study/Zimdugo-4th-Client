// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockerDetailMoreActionsModal } from "./LockerDetailMoreActionsModal";

describe("LockerDetailMoreActionsModal", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(() => cleanup());

  it("비로그인 메뉴에는 공유와 신고만 표시한다", () => {
    render(
      <LockerDetailMoreActionsModal
        isOpen
        onOpenChange={() => undefined}
        anchorRef={createRef<HTMLButtonElement>()}
        isFavorite={false}
        canFavorite={false}
        onShare={() => undefined}
        onFavoriteChange={() => undefined}
        onReport={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "공유하기" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "신고하기" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /즐겨찾기/ })).toBeNull();
  });

  it("닫기 버튼으로 메뉴를 닫는다", () => {
    const handleOpenChange = vi.fn();

    render(
      <LockerDetailMoreActionsModal
        isOpen
        onOpenChange={handleOpenChange}
        anchorRef={createRef<HTMLButtonElement>()}
        isFavorite={false}
        canFavorite
        onShare={() => undefined}
        onFavoriteChange={() => undefined}
        onReport={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "더보기 메뉴 닫기" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
