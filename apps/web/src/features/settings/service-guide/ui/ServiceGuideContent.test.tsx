import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ServiceGuideContent } from "./ServiceGuideContent";

const PROPS = {
  introTitle: "물품보관함, 이렇게 찾아보세요",
  introDescription: "검색부터 정보 확인까지, 세 단계면 충분해요.",
  steps: [
    {
      title: "1. 지도를 움직이거나 검색해요",
      description: "주변 보관함을 바로 볼 수 있어요.",
      icon: null,
    },
  ],
  checklistTitle: "이용 전에 꼭 확인하세요",
  checklistItems: ["개찰구 위치를 확인하세요."],
  faqTitle: "자주 묻는 질문",
  faqItems: [
    {
      id: "availability",
      question: "실시간 정보는 정확한가요?",
      answer: "현장 상황에 따라 달라질 수 있어요.",
    },
  ],
  notice: "현장 안내를 우선해 주세요.",
};

afterEach(cleanup);

describe("ServiceGuideContent", () => {
  it("안내 단계와 체크리스트와 FAQ를 구분해 보여준다", () => {
    render(<ServiceGuideContent {...PROPS} />);

    expect(
      screen.getByRole("heading", {
        name: "물품보관함, 이렇게 찾아보세요",
      }),
    ).toBeTruthy();
    expect(screen.getByText("개찰구 위치를 확인하세요.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "실시간 정보는 정확한가요?" }),
    ).toBeTruthy();
  });

  it("FAQ 질문을 누르면 답변을 펼친다", () => {
    render(<ServiceGuideContent {...PROPS} />);

    const trigger = screen.getByRole("button", {
      name: "실시간 정보는 정확한가요?",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("현장 상황에 따라 달라질 수 있어요.")).toBeTruthy();
  });
});
