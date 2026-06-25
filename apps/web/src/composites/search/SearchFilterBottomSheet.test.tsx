// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-draggable-bottom-sheet">{children}</div>
  ),
}));

import { SearchFilterBottomSheet } from "./SearchFilterBottomSheet";

afterEach(cleanup);

describe("SearchFilterBottomSheet", () => {
  it("applies selected indoor/outdoor and place filters", () => {
    setLanguageTag("ko");
    const handleApply = vi.fn();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SearchFilterBottomSheet onApply={handleApply} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "실내" }));
    fireEvent.click(screen.getByRole("button", { name: "실외" }));
    fireEvent.click(screen.getByRole("button", { name: "박물관" }));
    fireEvent.click(screen.getByRole("button", { name: "지하철역" }));
    fireEvent.click(screen.getByRole("button", { name: "보관함 보기" }));

    expect(handleApply).toHaveBeenCalledWith({
      regionActive: true,
      sizeActive: false,
      placeTypeActive: true,
      indoorOutdoorState: ["indoor", "outdoor"],
      placeTypeState: ["museum", "subway"],
      selectedSizes: [],
    });
  });

  it("restores previously applied filter values when reopened", () => {
    setLanguageTag("ko");

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SearchFilterBottomSheet
          initialFilters={{
            regionActive: false,
            sizeActive: false,
            placeTypeActive: true,
            indoorOutdoorState: ["indoor"],
            placeTypeState: ["museum"],
            selectedSizes: [],
          }}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("button", { name: "실내" }).getAttribute("data-active"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "박물관" })
        .getAttribute("data-active"),
    ).toBe("true");
  });
});
