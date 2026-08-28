// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  LOCKER_CORRECTION_REASON,
  type LockerCorrectionReason,
  type LockerCorrectionRequest,
  MAX_LOCKER_CORRECTION_DETAILS_LENGTH,
} from "../model/locker-correction-types";
import { LockerCorrectionRequestModal } from "./LockerCorrectionRequestModal";

function ControlledModal({
  onSubmit,
}: {
  onSubmit: (request: LockerCorrectionRequest) => void;
}) {
  const [reason, setReason] = useState<LockerCorrectionReason | null>(null);
  const [details, setDetails] = useState("");

  return (
    <LockerCorrectionRequestModal
      isOpen
      onOpenChange={() => undefined}
      reason={reason}
      onReasonChange={setReason}
      details={details}
      onDetailsChange={setDetails}
      onSubmit={onSubmit}
    />
  );
}

describe("LockerCorrectionRequestModal", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "CSS", {
      configurable: true,
      value: {
        escape: (value: string) => value,
      },
    });
  });

  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(() => cleanup());

  it("신고 유형을 선택하기 전에는 완료 버튼을 비활성화한다", () => {
    render(<ControlledModal onSubmit={() => undefined} />);

    expect(
      screen.getByRole("button", { name: "완료" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen.queryByRole("textbox", {
        name: "상세 내용을 입력해주세요 (선택).",
      }),
    ).toBeNull();
  });

  it("신고 유형과 상세 내용을 제출한다", () => {
    const handleSubmit = vi.fn();
    render(<ControlledModal onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
    fireEvent.click(
      screen.getByRole("option", { name: "위치가 잘못되었어요" }),
    );

    const detailsField = screen.getByRole("textbox", {
      name: "상세 내용을 입력해주세요 (선택).",
    });
    fireEvent.change(detailsField, {
      target: { value: " 2층으로 이전했어요. " },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      reason: LOCKER_CORRECTION_REASON.WrongLocation,
      details: "2층으로 이전했어요.",
    });
  });

  it("상세 내용의 글자 수를 표시하고 최대 길이로 제한한다", () => {
    render(<ControlledModal onSubmit={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
    fireEvent.click(screen.getByRole("option", { name: "기타 문제가 있어요" }));

    expect(
      screen.getByText(`0/${MAX_LOCKER_CORRECTION_DETAILS_LENGTH}`),
    ).toBeTruthy();

    const detailsField = screen.getByRole("textbox", {
      name: "상세 내용을 입력해주세요.",
    });
    fireEvent.change(detailsField, {
      target: { value: "가".repeat(MAX_LOCKER_CORRECTION_DETAILS_LENGTH + 1) },
    });

    expect(detailsField.getAttribute("maxlength")).toBe(
      String(MAX_LOCKER_CORRECTION_DETAILS_LENGTH),
    );
    expect((detailsField as HTMLTextAreaElement).value).toHaveLength(
      MAX_LOCKER_CORRECTION_DETAILS_LENGTH,
    );
    expect(
      screen.getByText(
        `${MAX_LOCKER_CORRECTION_DETAILS_LENGTH}/${MAX_LOCKER_CORRECTION_DETAILS_LENGTH}`,
      ),
    ).toBeTruthy();
  });

  it("기타 문제는 상세 내용을 입력하기 전까지 완료 버튼을 비활성화한다", () => {
    render(<ControlledModal onSubmit={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
    fireEvent.click(screen.getByRole("option", { name: "기타 문제가 있어요" }));

    const submitButton = screen.getByRole("button", { name: "완료" });
    const detailsField = screen.getByRole("textbox", {
      name: "상세 내용을 입력해주세요.",
    });

    expect(submitButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(detailsField, { target: { value: "   " } });
    expect(submitButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(detailsField, { target: { value: "기타 사유" } });
    expect(submitButton.hasAttribute("disabled")).toBe(false);
  });

  it("닫기 버튼으로 모달을 닫는다", () => {
    const handleOpenChange = vi.fn();

    render(
      <LockerCorrectionRequestModal
        isOpen
        onOpenChange={handleOpenChange}
        reason={null}
        onReasonChange={() => undefined}
        details=""
        onDetailsChange={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "신고하기 닫기" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
