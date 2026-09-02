// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const postPushDevice = vi.hoisted(() => vi.fn(async () => {}));
const getPushReminders = vi.hoisted(() => vi.fn(async () => []));

vi.mock("#/shared/api/push", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/shared/api/push")>()),
  postPushDevice,
  getPushReminders,
}));

vi.mock("../lib/push-subscription", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/push-subscription")>()),
  isPushSupported: () => false,
  syncPushSubscription: vi.fn(async () => false),
  revokePushSubscription: vi.fn(async () => {}),
}));

import { PUSH_REMINDER_QUERY_KEY } from "../model/push-reminder-queries";
import { usePushDevice } from "./usePushDevice";

describe("usePushDevice", () => {
  beforeEach(() => {
    postPushDevice.mockClear();
    getPushReminders.mockClear();
  });

  it("기기가 정해진 뒤 리마인더를 다시 읽는다", async () => {
    // 지도 컨트롤은 이 이펙트보다 먼저 조회를 시작한다. 쿠키가 없던 첫 방문이면
    // 그 결과는 기기가 정해지기 전 값이라 믿을 수 없다.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(PUSH_REMINDER_QUERY_KEY, []);

    const wrapper = ({ children }: { children?: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => usePushDevice(), { wrapper });

    await waitFor(() => expect(postPushDevice).toHaveBeenCalledOnce());

    // 무효화되면 다음 관찰에서 다시 읽힌다. 캐시가 낡은 것으로 표시됐는지 본다.
    await waitFor(() =>
      expect(
        queryClient.getQueryState(PUSH_REMINDER_QUERY_KEY)?.isInvalidated,
      ).toBe(true),
    );
  });
});
