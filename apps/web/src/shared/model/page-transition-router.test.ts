import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { isPathnameTransitionPending } from "./page-transition";

const createTransitionTestRouter = () => {
  let resolveSettings: (() => void) | undefined;
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    loader: () =>
      new Promise<void>((resolve) => {
        resolveSettings = resolve;
      }),
  });
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({
    history,
    routeTree: rootRoute.addChildren([indexRoute, settingsRoute]),
  });

  return Object.assign(router, {
    resolveSettings: () => resolveSettings?.(),
  });
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
    expect(router.state.resolvedLocation).toBeUndefined();
    expect(router.state.matches.at(-1)?.pathname).toBe("/");
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
