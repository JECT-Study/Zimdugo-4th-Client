import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Popup", () => {
  it("X 닫기 버튼을 포함하지 않는다", () => {
    const currentFilePath = fileURLToPath(import.meta.url);
    const targetFilePath = resolve(
      dirname(currentFilePath),
      "../../../../../packages/ui/src/components/popup/Popup.tsx",
    );
    const popupSource = readFileSync(targetFilePath, "utf8");

    expect(popupSource).not.toContain("IconX24");
    expect(popupSource).not.toContain('aria-label="닫기"');
  });
});
