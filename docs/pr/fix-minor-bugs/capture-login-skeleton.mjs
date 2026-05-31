import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const assetsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "assets",
);
const storyUrl =
  "http://127.0.0.1:6008/iframe.html?id=features-auth-loginpageskeleton--mobile-viewport&viewMode=story";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(storyUrl, { waitUntil: "networkidle", timeout: 60_000 });

const skeleton = page.locator('div[aria-hidden="true"]').filter({
  has: page.locator('div[style*="width: 114px"][style*="height: 114px"]'),
});
await skeleton.waitFor({ state: "visible", timeout: 60_000 });
await page
  .locator('div[style*="height: 48px"]')
  .nth(2)
  .waitFor({ state: "visible", timeout: 60_000 });
await page.waitForTimeout(400);

await skeleton.screenshot({
  path: path.join(assetsDir, "05-login-skeleton.png"),
});
await browser.close();
console.log("saved 05-login-skeleton.png");
