// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { LockerCorrectionRequestFlow } from "./LockerCorrectionRequestFlow";

function OpenFlow({
  onConfirm,
}: {
  onConfirm: (request: unknown) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* 제출 중에는 모달의 닫기 버튼이 잠기므로, 부모가 내리는 경우를 흉내낸다. */}
      <button
        type="button"
        data-testid="parent-close"
        onClick={() => setIsOpen(false)}
      >
        부모가 닫기
      </button>
      <LockerCorrectionRequestFlow
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={onConfirm}
      />
    </>
  );
}

const submitWithReason = (optionName: string) => {
  fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
  fireEvent.click(screen.getByRole("option", { name: optionName }));
  fireEvent.click(screen.getByRole("button", { name: "완료" }));
  fireEvent.click(screen.getByRole("button", { name: "예" }));
};

describe("LockerCorrectionRequestFlow 제출 실패 안내", () => {
  beforeEach(() => {
    setTestLanguage("ko");
    // react-aria 가 CSS.escape 를 쓴다. jsdom 에는 없다.
    Object.defineProperty(globalThis, "CSS", {
      configurable: true,
      value: { escape: (value: string) => value },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("실패하면 확인 팝업만 닫고 다이얼로그 안에 안내를 남긴다", async () => {
    let rejectSubmit: ((reason: unknown) => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSubmit = reject;
        }),
    );

    render(<OpenFlow onConfirm={onConfirm} />);
    submitWithReason("위치가 잘못되었어요");

    await act(async () => rejectSubmit?.({ response: { status: 500 } }));

    expect(
      screen.queryByRole("dialog", { name: "정말 제출하시겠어요?" }),
    ).toBeNull();
    expect(screen.queryByRole("dialog", { name: "신고 접수됨" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "신고하기" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe(
      "신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.",
    );
    // 그 자리에서 다시 시도할 수 있어야 한다.
    expect(
      screen
        .getByRole("button", { name: "완료" })
        .hasAttribute("data-disabled"),
    ).toBe(false);
  });

  it("상태 코드별로 다른 안내를 보여주고, 입력을 고치면 지운다", async () => {
    let rejectSubmit: ((reason: unknown) => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSubmit = reject;
        }),
    );

    render(<OpenFlow onConfirm={onConfirm} />);
    submitWithReason("위치가 잘못되었어요");

    await act(async () => rejectSubmit?.({ response: { status: 404 } }));

    expect(screen.getByRole("alert").textContent).toBe(
      "이미 삭제된 보관함이에요.",
    );

    fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
    fireEvent.click(screen.getByRole("option", { name: "가격 정보가 달라요" }));

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("대기 중에 닫으면 뒤늦게 도착한 결과를 반영하지 않는다", async () => {
    let settleSubmit:
      | { resolve: () => void; reject: (reason: unknown) => void }
      | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          settleSubmit = { resolve, reject };
        }),
    );

    render(<OpenFlow onConfirm={onConfirm} />);
    submitWithReason("위치가 잘못되었어요");

    // 응답을 기다리는 동안 흐름이 닫힌다.
    // 모달이 열리면 바깥은 aria-hidden 이라 role 조회가 닿지 않는다.
    fireEvent.click(screen.getByTestId("parent-close"));

    await act(async () => settleSubmit?.reject({ response: { status: 500 } }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("dialog", { name: "신고하기" })).toBeNull();
    expect(screen.queryByRole("dialog", { name: "신고 접수됨" })).toBeNull();
  });

  it("대기 중에 닫으면 뒤늦은 성공도 팝업을 열지 않는다", async () => {
    let settleSubmit: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          settleSubmit = resolve;
        }),
    );

    render(<OpenFlow onConfirm={onConfirm} />);
    submitWithReason("위치가 잘못되었어요");

    // 모달이 열리면 바깥은 aria-hidden 이라 role 조회가 닿지 않는다.
    fireEvent.click(screen.getByTestId("parent-close"));

    await act(async () => settleSubmit?.());

    expect(screen.queryByRole("dialog", { name: "신고 접수됨" })).toBeNull();
  });

  it("안내 자리는 평소에도 비워둔 채 유지한다", () => {
    render(<OpenFlow onConfirm={vi.fn(async () => {})} />);

    // 실패 순간 버튼이 밀려 내려가지 않도록 자리를 미리 잡아둔다.
    const reserved = screen
      .getByRole("dialog", { name: "신고하기" })
      .querySelector('p[aria-hidden="true"]');

    expect(reserved?.textContent).toBe(" ");
  });
});
