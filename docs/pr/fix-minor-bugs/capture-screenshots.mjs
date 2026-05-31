import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(ROOT, "assets");
const APP_BASE = "http://127.0.0.1:3010";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStyledLogin(page) {
  await page.waitForFunction(
    () => {
      const links = [...document.querySelectorAll("a")];
      const naver = links.find((link) => link.textContent?.includes("네이버"));
      if (!(naver instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(naver);
      return (
        style.height === "48px" &&
        style.display === "flex" &&
        style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        style.backgroundColor !== "transparent"
      );
    },
    { timeout: 30_000 },
  );
}

async function captureStyledLogin(page, url, filename) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
  await waitForStyledLogin(page);
  await wait(300);
  await page.screenshot({ path: path.join(assetsDir, filename) });
}

async function captureLoginSkeleton(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    const client = await page.createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });

    await page.goto(`${APP_BASE}/login?returnPath=/`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await page
      .waitForSelector('[aria-hidden="true"]', { timeout: 3_000 })
      .catch(() => undefined);

    await page.screenshot({
      path: path.join(assetsDir, "05-login-skeleton.png"),
    });
  } finally {
    await context.close();
  }
}

async function captureAppScreenshots(page) {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

  await page.goto(`${APP_BASE}/`, { waitUntil: "networkidle2", timeout: 60_000 });
  await wait(2000);
  await page.screenshot({
    path: path.join(assetsDir, "01-home-map-controls.png"),
  });

  await page.goto(`${APP_BASE}/`, { waitUntil: "networkidle2", timeout: 60_000 });
  const reportTab = await page.waitForSelector('a[href="/report"]', {
    timeout: 10_000,
  });
  await reportTab.click();
  await wait(1000);
  await page.screenshot({
    path: path.join(assetsDir, "03-auth-popup.png"),
  });
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await captureLoginSkeleton(browser);
    await captureAppScreenshots(page);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
