import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationDiagnosticsPanel } from "./LocationDiagnosticsPanel";

describe("LocationDiagnosticsPanel", () => {
  const getCurrentPosition = vi.fn();

  beforeEach(() => {
    getCurrentPosition.mockReset();
    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({
          state: "prompt",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      },
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        clearWatch: vi.fn(),
        getCurrentPosition,
        watchPosition: vi.fn().mockReturnValue(1),
      },
    });
  });

  it("does not render when diagnostics are disabled", () => {
    render(<LocationDiagnosticsPanel isEnabled={false} />);

    expect(screen.queryByRole("region")).toBeNull();
  });

  it("requests location from a user action without recording coordinates", async () => {
    getCurrentPosition.mockImplementation((onSuccess: PositionCallback) => {
      onSuccess({
        coords: {
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 37.5,
          longitude: 127,
          speed: null,
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    });
    render(<LocationDiagnosticsPanel isEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "1회 위치 요청" }));

    await waitFor(() => {
      expect(screen.getByText(/get-current-position-success/)).toBeDefined();
    });
    expect(screen.queryByText(/37\.5|127/)).toBeNull();
  });
});
