import { expect, type Page, test } from "@playwright/test";

/**
 * 테마를 바꿀 때 보던 위치를 잃지 않는지 본다.
 *
 * 커스텀 스타일을 이미 만들어진 지도에 다시 붙이는 API 가 없어 테마가 바뀌면
 * 지도를 새로 만든다. 그때 카메라를 넘겨받아도, 지도 인스턴스가 바뀐 것을 보고
 * 다시 카메라를 잡는 코드가 있으면 사용자가 옮겨 둔 위치가 덮인다.
 *
 * 카메라 값은 밖으로 드러나지 않으므로 마커의 화면 좌표로 잰다. 카메라가
 * 유지되면 마커도 제자리에 있고, 다시 잡히면 눈에 띄게 튄다.
 *
 * 딥링크 상세(`?locker=...`)도 같은 문제를 겪었지만 여기서 잡지 못한다. 그 경로의
 * 재적용 조건은 라우트 loader 가 채우는 `loaderData.detail` 인데, loader 는 서버에서
 * API 를 부르므로 브라우저 요청만 가로채는 이 스텁으로는 채울 수 없다. 그래서
 * 재현되지 않는 테스트를 두는 대신 검색 경로만 남긴다.
 */

const LOCKER_ID = 500;
const OTHER_LOCKER_ID = 501;

const lockerDetailRaw = (lockerId: number) => ({
  lockerId,
  lockerName: `보관함 ${lockerId}`,
  roadAddress: "서울 강남구 강남대로 지하 396",
  latitude: lockerId === LOCKER_ID ? 37.4979 : 37.4989,
  longitude: lockerId === LOCKER_ID ? 127.0276 : 127.0286,
  lockerType: "SUBWAY",
  updatedAt: "2026-08-01T00:00:00",
  distanceMeters: 120,
  minPrice: 2000,
  maxPrice: 4000,
  isFavorite: false,
  floor: 1,
  groundLevelType: "UNDERGROUND",
  lockerSizes: ["SMALL", "MEDIUM"],
  detailInfo: "개찰구를 지나 왼쪽",
  accurateVoteCount: 10,
  inaccurateVoteCount: 1,
});

const pinsRaw = [LOCKER_ID, OTHER_LOCKER_ID].map((lockerId) => ({
  pinType: "LOCKER",
  lockerId,
  placeId: null,
  latitude: lockerId === LOCKER_ID ? 37.4979 : 37.4989,
  longitude: lockerId === LOCKER_ID ? 127.0276 : 127.0286,
  isFavorite: false,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  markerStatus: "active",
}));

const searchBounds = {
  swLat: 37.49,
  swLng: 127.02,
  neLat: 37.51,
  neLng: 127.04,
};

const searchItemsRaw = [LOCKER_ID, OTHER_LOCKER_ID].map((lockerId) => ({
  ...lockerDetailRaw(lockerId),
  placeId: null,
}));

const apiEnvelope = (data: unknown) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: new Date().toISOString(),
  data,
});

const stubApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const lockerIdMatch = url.match(/\/lockers\/(\d+)/);
    const data = url.includes("/pins")
      ? { items: pinsRaw }
      : lockerIdMatch
        ? lockerDetailRaw(Number(lockerIdMatch[1]))
        : url.includes("/search")
          ? { items: searchItemsRaw, hasNext: false, bounds: searchBounds }
          : url.includes("/suggest")
            ? { items: [], hasNext: false }
            : {};

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(data)),
    });
  });
};

const waitForMapReady = async (page: Page) => {
  await expect(page.locator('[data-map-state="ready"]')).toBeAttached();
};

const markerCount = (page: Page) =>
  page.locator(".map-marker-offset-wrapper").count();

const waitForMarkers = async (page: Page) => {
  await expect.poll(() => markerCount(page)).toBeGreaterThan(0);
};

/** 첫 마커의 화면 좌표. 카메라가 움직이면 함께 움직인다. */
const markerPosition = async (page: Page) => {
  const box = await page
    .locator(".map-marker-offset-wrapper")
    .first()
    .boundingBox();
  if (!box) throw new Error("마커를 찾지 못했다");

  return { x: Math.round(box.x), y: Math.round(box.y) };
};

/**
 * 지도를 끌어 카메라를 옮긴다.
 *
 * 모바일 프로젝트라 SDK 가 터치를 듣는다. 마우스로 끌면 아무 일도 일어나지 않아
 * 터치 이벤트를 직접 만들어 보낸다. 시트와 헤더를 피해 지도가 드러난 위쪽을 잡는다.
 */
const dragMap = async (page: Page, dx: number, dy: number) => {
  const size = page.viewportSize();
  if (!size) throw new Error("뷰포트 크기를 알 수 없다");

  const startX = Math.round(size.width / 2);
  const startY = 240;

  const dragged = await page.evaluate(
    async ({ startX, startY, dx, dy }) => {
      const target =
        document.querySelector("canvas") ??
        document.querySelector("[data-map-state] div");
      if (!target) return false;

      const at = (x: number, y: number) =>
        new Touch({
          identifier: 1,
          target,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
        });
      const fire = (type: string, x: number, y: number) =>
        target.dispatchEvent(
          new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            touches: type === "touchend" ? [] : [at(x, y)],
            targetTouches: type === "touchend" ? [] : [at(x, y)],
            changedTouches: [at(x, y)],
          }),
        );
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      fire("touchstart", startX, startY);
      await wait(60);
      const steps = 10;
      for (let step = 1; step <= steps; step += 1) {
        fire(
          "touchmove",
          startX + (dx * step) / steps,
          startY + (dy * step) / steps,
        );
        await wait(30);
      }
      fire("touchend", startX + dx, startY + dy);
      return true;
    },
    { startX, startY, dx, dy },
  );

  expect(dragged, "지도를 찾지 못했다").toBe(true);
  await page.waitForTimeout(1_500);
};

/** 헤더 테마 버튼. 지도 오버레이가 실제 탭을 가로채므로 요소를 직접 누른다. */
const pressThemeToggle = async (page: Page) => {
  const pressed = await page.evaluate(() => {
    const button = [...document.querySelectorAll("header button")].find(
      (candidate) => /모드/.test(candidate.getAttribute("aria-label") ?? ""),
    );
    if (!button) return false;

    (button as HTMLButtonElement).click();
    return true;
  });

  expect(pressed, "테마 버튼을 찾지 못했다").toBe(true);
  // 지도를 다시 만들고 마커를 다시 얹을 때까지 기다린다.
  await page.waitForTimeout(2_000);
  await waitForMarkers(page);
};

/** 마커가 몇 픽셀 움직였는지. 타일 렌더링 오차만큼은 허용한다. */
const MOVE_TOLERANCE_PX = 12;

test.beforeEach(async ({ page }) => {
  await stubApi(page);
});

test.describe("테마 전환과 지도 카메라", () => {
  test("검색 목록을 연 뒤 지도를 옮겨도 테마 전환이 검색 범위로 되돌리지 않는다", async ({
    page,
  }) => {
    await page.goto("/?q=강남");
    await waitForMapReady(page);
    await waitForMarkers(page);
    // 검색 범위에 맞춰 카메라가 안착할 시간을 준다.
    await page.waitForTimeout(1_500);

    await dragMap(page, -110, -90);
    const movedTo = await markerPosition(page);

    await pressThemeToggle(page);
    const afterToggle = await markerPosition(page);

    expect(
      Math.abs(afterToggle.x - movedTo.x),
      "테마를 바꿨더니 카메라가 검색 결과 범위로 되돌아갔다",
    ).toBeLessThanOrEqual(MOVE_TOLERANCE_PX);
    expect(
      Math.abs(afterToggle.y - movedTo.y),
      "테마를 바꿨더니 카메라가 검색 결과 범위로 되돌아갔다",
    ).toBeLessThanOrEqual(MOVE_TOLERANCE_PX);
  });
});
