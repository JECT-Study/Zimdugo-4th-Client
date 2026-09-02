// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postPushReminder = vi.hoisted(() =>
  vi.fn(async () => ({
    id: 1,
    lockerId: 171,
    startedAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 600_000).toISOString(),
    totalUsageMinutes: 10,
    remainingMinutes: 10,
    remindBeforeMinutes: null,
  })),
);
const postPushDevice = vi.hoisted(() => vi.fn(async () => {}));
const deletePushReminder = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("#/shared/api/push", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/shared/api/push")>()),
  postPushDevice,
  postPushReminder,
  deletePushReminder,
  getPushReminders: vi.fn(async () => []),
}));

const ensurePushSubscription = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("../lib/push-subscription", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/push-subscription")>()),
  ensurePushSubscription,
  isPushSupported: () => true,
  isIosWithoutInstall: () => false,
}));

import { useLockerTimerSession } from "./useLockerTimerSession";

const wrapper = ({ children }: { children?: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useLockerTimerSession", () => {
  beforeEach(() => {
    postPushDevice.mockClear();
    postPushReminder.mockClear();
    ensurePushSubscription.mockClear();
    deletePushReminder.mockClear();
    vi.stubGlobal("Notification", { permission: "granted" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("시작이 끝나기 전에 다시 시작하면 두 번째는 흘려보낸다", async () => {
    // 리마인더 뮤테이션이 시작되기 전 구간 — 기기 초기화와 구독 등록을 기다리는
    // 동안에도 잠겨 있어야 한다. 두 흐름이 나란히 돌면 두 번째가 한도 초과로
    // 끝나 타이머는 켜졌는데 실패 팝업이 뜬다.
    let finishSubscription = () => {};
    ensurePushSubscription.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishSubscription = () => resolve(undefined);
        }),
    );

    const { result } = renderHook(() => useLockerTimerSession(171), {
      wrapper,
    });

    let firstStart: Promise<boolean> | undefined;
    let secondStart: Promise<boolean> | undefined;

    await act(async () => {
      firstStart = result.current.start(600);
      secondStart = result.current.start(600);
    });

    await expect(secondStart).resolves.toBe(false);
    expect(ensurePushSubscription).toHaveBeenCalledOnce();
    expect(postPushReminder).not.toHaveBeenCalled();

    await act(async () => {
      finishSubscription();
      await firstStart;
    });

    expect(postPushReminder).toHaveBeenCalledOnce();
  });

  it("권한 팝업을 기다리는 동안 다시 시작해도 흘려보낸다", async () => {
    // 잠금이 권한 요청 뒤에 걸리면, 권한이 아직 default 일 때 두 번째 클릭이
    // 재진입 검사를 그대로 통과한다.
    let grantPermission = () => {};
    const requestPermission = vi.fn(
      () =>
        new Promise<NotificationPermission>((resolve) => {
          grantPermission = () => resolve("granted");
        }),
    );
    vi.stubGlobal("Notification", { permission: "default", requestPermission });

    const { result } = renderHook(() => useLockerTimerSession(171), {
      wrapper,
    });

    let firstStart: Promise<boolean> | undefined;
    let secondStart: Promise<boolean> | undefined;

    await act(async () => {
      firstStart = result.current.start(600);
      secondStart = result.current.start(600);
    });

    await expect(secondStart).resolves.toBe(false);
    expect(requestPermission).toHaveBeenCalledOnce();

    await act(async () => {
      grantPermission();
      await firstStart;
    });

    expect(postPushReminder).toHaveBeenCalledOnce();
  });

  it("끄기가 끝나기 전에 다시 끄면 두 번째는 흘려보낸다", async () => {
    // 늦게 성공한 두 번째 삭제의 onSuccess 가 그사이 만들어진 리마인더까지
    // 캐시에서 지운다.
    const { result } = renderHook(() => useLockerTimerSession(171), {
      wrapper,
    });

    await act(async () => {
      await result.current.start(600);
    });

    let firstStop: Promise<boolean> | undefined;
    let secondStop: Promise<boolean> | undefined;

    await act(async () => {
      firstStop = result.current.stop();
      secondStop = result.current.stop();
    });

    await expect(secondStop).resolves.toBe(false);
    expect(deletePushReminder).toHaveBeenCalledOnce();
    await act(async () => {
      await firstStop;
    });
  });

  it("시작이 끝나면 다시 시작할 수 있다", async () => {
    const { result } = renderHook(() => useLockerTimerSession(171), {
      wrapper,
    });

    await act(async () => {
      await result.current.start(600);
    });
    await act(async () => {
      await result.current.start(600);
    });

    expect(postPushReminder).toHaveBeenCalledTimes(2);
  });
});
