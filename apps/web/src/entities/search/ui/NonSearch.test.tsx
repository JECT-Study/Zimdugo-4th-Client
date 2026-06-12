// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NonSearch } from "./NonSearch";

afterEach(cleanup);

describe("NonSearch", () => {
  it("사용처에서 전달한 제목과 설명을 표시한다", () => {
    render(
      <NonSearch
        titleText="즐겨찾기가 없어요"
        descriptionText={
          "아직 즐겨찾기가 없어요\n맘에드는 보관함을 등록해주세요!"
        }
      />,
    );

    expect(screen.getByText("즐겨찾기가 없어요")).toBeTruthy();
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          "아직 즐겨찾기가 없어요\n맘에드는 보관함을 등록해주세요!",
      ),
    ).toBeTruthy();
  });

  it("영어 보조 문구를 숨길 수 있다", () => {
    render(<NonSearch showEnglishSub={false} />);

    expect(screen.queryByText("There's no search result")).toBeNull();
  });
});
