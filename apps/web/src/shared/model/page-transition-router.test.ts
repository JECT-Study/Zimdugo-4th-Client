import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { isPathnameTransitionPending } from "./page-transition";

const createTransitionTestRouter = () => {
  // 게이트를 로더 밖에서 미리 만든다. 로더가 언제 불리는지는 라우터 사정이고,
  // 테스트가 열어 줄 때 아직 안 불렸으면 resolve 가 없어 영영 안 끝난다.
  let openSettingsGate!: () => void;
  const settingsGate = new Promise<void>((resolve) => {
    openSettingsGate = resolve;
  });
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    loader: () => settingsGate,
  });
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({
    history,
    routeTree: rootRoute.addChildren([indexRoute, settingsRoute]),
  });

  return Object.assign(router, { resolveSettings: openSettingsGate });
};

const getTransitionVisibility = (
  router: ReturnType<typeof createTransitionTestRouter>,
) =>
  isPathnameTransitionPending({
    status: router.state.status,
    currentPathname: router.state.location.pathname,
    resolvedPathname:
      router.state.resolvedLocation?.pathname ??
      router.state.matches.at(-1)?.pathname,
  });

describe("page transition router integration", () => {
  it("programmatic pathname navigation 동안 Router 상태로 표시하고 완료 시 종료한다", async () => {
    const router = createTransitionTestRouter();
    await router.load();

    const navigation = router.navigate({ to: "/settings" });
    await Promise.resolve();

    expect(router.state.location.pathname).toBe("/settings");
    // 이동 중에는 아직 떠나지 않은 곳이 "/" 로 남아 있어야 한다. 라우터가 그걸
    // resolvedLocation 으로 주는지 matches 로만 알 수 있는지는 버전마다 다르다.
    // 우리가 기대는 건 둘 중 하나로 "/" 를 얻는다는 것뿐이라 그대로 확인한다.
    expect(
      router.state.resolvedLocation?.pathname ??
        router.state.matches.at(-1)?.pathname,
    ).toBe("/");
    expect(getTransitionVisibility(router)).toBe(true);

    router.resolveSettings();
    await navigation;

    expect(getTransitionVisibility(router)).toBe(false);
  });

  it("같은 pathname의 query 갱신은 pending이어도 표시하지 않는다", async () => {
    const router = createTransitionTestRouter();
    await router.load();

    const navigation = router.navigate({
      to: "/",
      search: { q: "locker" },
    });
    await Promise.resolve();

    expect(router.state.location.pathname).toBe("/");
    expect(getTransitionVisibility(router)).toBe(false);

    await navigation;
  });
});
