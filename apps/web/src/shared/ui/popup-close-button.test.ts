import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Popup", () => {
  it("X 닫기 버튼을 포함하지 않는다", () => {
    const popupSource = readFileSync(
      new URL(
        "../../../../../packages/ui/src/components/popup/Popup.tsx",
        import.meta.url,
      ),
      "utf8",
    );

    expect(popupSource).not.toContain("IconX24");
    expect(popupSource).not.toContain('aria-label="닫기"');
  });
});
