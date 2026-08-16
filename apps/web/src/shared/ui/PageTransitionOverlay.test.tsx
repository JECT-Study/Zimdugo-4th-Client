import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageTransitionContentBoundary } from "./PageTransitionOverlay";

afterEach(cleanup);

describe("PageTransitionContentBoundary", () => {
  it("blocks pointer and Enter/Space activation while blocked", () => {
    let activationCount = 0;
    render(
      <PageTransitionContentBoundary isBlocked>
        <button type="button" onClick={() => activationCount++}>
          Continue
        </button>
      </PageTransitionContentBoundary>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.parentElement?.getAttribute("inert")).toBe("");

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });

    expect(activationCount).toBe(0);
  });

  it("restores activation after the transition ends", () => {
    let activationCount = 0;
    const { container, rerender } = render(
      <PageTransitionContentBoundary isBlocked>
        <button type="button" onClick={() => activationCount++}>
          Continue
        </button>
      </PageTransitionContentBoundary>,
    );

    rerender(
      <PageTransitionContentBoundary isBlocked={false}>
        <button type="button" onClick={() => activationCount++}>
          Continue
        </button>
      </PageTransitionContentBoundary>,
    );

    fireEvent.click(container.querySelector("button") as HTMLButtonElement);

    expect(activationCount).toBe(1);
    expect(
      container.querySelector("button")?.parentElement?.getAttribute("inert"),
    ).toBeNull();
  });
});
