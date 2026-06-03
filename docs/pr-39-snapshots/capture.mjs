import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function waitForPaint(page) {
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function waitForLanguagePage(page) {
  await page.waitForSelector("button[aria-pressed]", {
    state: "visible",
    timeout: 60_000,
  });
  await page.waitForFunction(() => {
    const btn = document.querySelector("button[aria-pressed]");
    if (!btn) return false;
    const h = parseFloat(getComputedStyle(btn).height);
    return h >= 40;
  }, { timeout: 60_000 });
  await waitForPaint(page);
}

async function waitForContent(page, selector) {
  await page.waitForSelector(selector, { state: "visible", timeout: 60_000 });
  await waitForPaint(page);
}

const routes = [
  {
    file: "settings-language.png",
    url: "http://localhost:3010/settings/language",
    wait: waitForLanguagePage,
  },
  {
    file: "settings-terms.png",
    url: "http://localhost:3010/settings/terms",
    wait: (p) => waitForContent(p, 'role=heading[name="1. 목적"]'),
  },
  {
    file: "settings-privacy.png",
    url: "http://localhost:3010/settings/privacy",
    wait: (p) =>
      waitForContent(p, 'role=heading[name="1. 개인정보의 처리 목적"]'),
  },
  {
    file: "settings-notices.png",
    url: "http://localhost:3010/settings/notices",
    wait: (p) => waitForContent(p, "text=페이지가 존재하지 않습니다"),
  },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

for (const route of routes) {
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  try {
    await page.goto(route.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await route.wait(page);
    await page.screenshot({
      path: path.join(__dirname, route.file),
      fullPage: true,
    });
    console.log(`saved ${route.file}`);
  } catch (err) {
    console.error(`failed ${route.file}:`, err.message);
    throw err;
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();
