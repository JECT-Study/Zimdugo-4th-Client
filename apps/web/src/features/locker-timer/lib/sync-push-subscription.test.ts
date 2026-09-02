// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const putPushSubscription = vi.hoisted(() => vi.fn());
const getPushVapidPublicKey = vi.hoisted(() =>
  vi.fn(
    async () =>
      "BLpB8OmQGMwP03BTnvmBUrRJBaKX4o5C0Mmv3NXsZwIqWPVwKzRPGUP7v-LxwOV6LreEa5zpdtqMUsBfz3kTCtA=",
  ),
);

vi.mock("#/shared/api/push", () => ({
  putPushSubscription,
  getPushVapidPublicKey,
  deletePushSubscription: vi.fn(),
}));

import { syncPushSubscription } from "./push-subscription";

const buildSubscription = (endpoint: string) => ({
  endpoint,
  toJSON: () => ({ keys: { p256dh: "p256dh-value", auth: "auth-value" } }),
});

/** 브라우저 구독 상태를 원하는 대로 세운다. */
const stubPushEnvironment = ({
  permission,
  existing,
}: {
  permission: NotificationPermission;
  existing: ReturnType<typeof buildSubscription> | null;
}) => {
  const subscribe = vi.fn(async () => buildSubscription("endpoint-new"));
  const registration = {
    pushManager: {
      getSubscription: vi.fn(async () => existing),
      subscribe,
    },
  };

  vi.stubGlobal("Notification", { permission });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      ready: Promise.resolve(registration),
      getRegistration: vi.fn(async () => registration),
    },
  });
  vi.stubGlobal("PushManager", function PushManager() {});

  return { subscribe };
};

describe("syncPushSubscription", () => {
  beforeEach(() => {
    putPushSubscription.mockClear();
    getPushVapidPublicKey.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("구독이 살아 있으면 새로 만들지 않고 서버에만 다시 올린다", async () => {
    const { subscribe } = stubPushEnvironment({
      permission: "granted",
      existing: buildSubscription("endpoint-existing"),
    });

    await expect(syncPushSubscription("ja")).resolves.toBe(true);

    expect(subscribe).not.toHaveBeenCalled();
    // 두 번째 인자는 취소 신호다. 여기서는 본문만 본다.
    expect(putPushSubscription.mock.calls[0]?.[0]).toEqual({
      endpoint: "endpoint-existing",
      keys: { p256dh: "p256dh-value", auth: "auth-value" },
      locale: "ja",
    });
  });

  it("권한이 남아 있는데 구독이 사라졌으면 다시 만들어 올린다", async () => {
    // 열린 탭이 없을 때 pushsubscriptionchange 가 오면 통지를 받을 곳이 없다.
    // 여기서 되살리지 않으면 권한은 허용된 채 푸시만 영영 오지 않는다.
    const { subscribe } = stubPushEnvironment({
      permission: "granted",
      existing: null,
    });

    await expect(syncPushSubscription("ko")).resolves.toBe(true);

    expect(subscribe).toHaveBeenCalledOnce();
    expect(putPushSubscription.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ endpoint: "endpoint-new", locale: "ko" }),
    );
  });

  it("권한을 준 적이 없으면 아무것도 만들지 않는다", async () => {
    const { subscribe } = stubPushEnvironment({
      permission: "default",
      existing: null,
    });

    await expect(syncPushSubscription("ko")).resolves.toBe(false);

    expect(subscribe).not.toHaveBeenCalled();
    expect(putPushSubscription).not.toHaveBeenCalled();
  });

  it("사용자가 권한을 거뒀으면 아무것도 만들지 않는다", async () => {
    const { subscribe } = stubPushEnvironment({
      permission: "denied",
      existing: null,
    });

    await expect(syncPushSubscription("ko")).resolves.toBe(false);

    expect(subscribe).not.toHaveBeenCalled();
    expect(putPushSubscription).not.toHaveBeenCalled();
  });
});
