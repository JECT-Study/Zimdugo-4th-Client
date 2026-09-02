import {
  IconNavigationCrosshair24,
  IconNavigationRefresh24,
} from "@repo/ui/assets/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { resolveDetailSheetVisibleHeight } from "#/composites/locker-detail/LockerDetailBottomSheet";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import { createBottomMapInset } from "#/entities/map/model/map-inset";
import { MAP_CONTROL_FALLBACK_BOTTOM_PX } from "#/entities/map/ui/map-control-stack-fallback";
import { PUSH_REMINDER_QUERY_KEY } from "#/features/locker-timer/model/push-reminder-queries";
import { LockerTimerMapControl } from "#/features/locker-timer/ui/LockerTimerMapControl";
import {
  locationButton,
  locationControlStack,
  myLocationIcon,
} from "#/routes/-index.css";
import { resolveMapControlBottomPx } from "#/routes/-map-control-visibility";
import { HomeHeader } from "./HomeHeader";

const createStoryQueryClient = (hasActiveTimer: boolean) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // 스토리에서는 심어 둔 값만 쓴다. 다시 읽으면 실제 API 를 때린다.
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
      },
    },
  });

  client.setQueryData(
    PUSH_REMINDER_QUERY_KEY,
    hasActiveTimer
      ? [
          {
            id: 1,
            lockerId: 101,
            startedAt: new Date().toISOString(),
            endAt: new Date(
              Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000,
            ).toISOString(),
            totalUsageMinutes: 330,
            remainingMinutes: 330,
            remindBeforeMinutes: null,
          },
        ]
      : [],
  );

  return client;
};

interface HomeMapChromePreviewProps {
  /** 세로로 짧은 화면(가로 모드)에서 컨트롤이 검색 바를 덮지 않는지 보기 위한 값 */
  viewportHeight?: number;
  /** 열려 있는 상세 시트 단계. 컨트롤이 시트를 따라 올라간다. */
  detailSheetStage?: "mini" | "half" | "full" | "dismiss";
  /** 실행 중인 타이머 컨트롤을 함께 표시한다. */
  hasActiveTimer?: boolean;
}

function HomeMapChromePreview({
  viewportHeight = 720,
  detailSheetStage = "dismiss",
  hasActiveTimer = false,
}: HomeMapChromePreviewProps) {
  const controlBottom = resolveMapControlBottomPx({
    baseBottomPx: MAP_CONTROL_FALLBACK_BOTTOM_PX,
    obscuredInset: createBottomMapInset(
      resolveDetailSheetVisibleHeight(detailSheetStage),
    ),
    windowHeightPx: viewportHeight,
  });

  /*
   * 타이머는 서버 상태다. 스토리에서는 네트워크 대신 캐시에 심는다.
   *
   * 이펙트가 아니라 클라이언트를 만들 때 심는다. 이펙트는 자식이 그려진 뒤에
   * 도는데, 그사이 지도 컨트롤의 조회가 먼저 나가 실제 API 를 때린다. 늦게 도착한
   * 응답이 심어 둔 값을 덮으면 스토리가 그 기기의 상태에 따라 달라진다.
   *
   * 인자가 바뀌면 다시 만든다. 한 번만 만들면 Controls 에서 값을 바꿔도 캐시가
   * 그대로라, 화면이 지금 인자와 다른 상태를 보여 준다.
   */
  const queryClient = useMemo(
    () => createStoryQueryClient(hasActiveTimer),
    [hasActiveTimer],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <main
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          height: viewportHeight,
          minHeight: viewportHeight,
          margin: "0 auto",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #e4eadf 0%, #f0eee4 48%, #dce7e9 100%)",
        }}
      >
        <HomeHeader
          profileImageUrl=""
          onProfilePress={() => undefined}
          onLogoPress={() => undefined}
          mapColorScheme="light"
          onMapColorSchemePress={() => undefined}
        />
        <HomeSearchBar onOpenSearch={() => undefined} />
        {/* null 은 놓을 자리가 없다는 뜻이다. 실제 앱도 이때 렌더하지 않는다. */}
        {controlBottom !== null && (
          <div
            className={locationControlStack}
            style={{ bottom: controlBottom }}
          >
            <LockerTimerMapControl
              buttonClassName={locationButton}
              onSelect={() => {}}
            />
            <button
              type="button"
              className={locationButton}
              aria-label="지도 새로고침"
            >
              <IconNavigationRefresh24 />
            </button>
            <button
              type="button"
              className={locationButton}
              aria-label="내 위치"
            >
              <IconNavigationCrosshair24 className={myLocationIcon} />
            </button>
          </div>
        )}
      </main>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Product/Home/Map Chrome",
  component: HomeMapChromePreview,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeMapChromePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 상세 시트에서 시작한 타이머가 홈 지도 컨트롤에 이어진 상태다. */
export const TimerRunning: Story = {
  args: { hasActiveTimer: true },
};

/** 상세 시트를 하프로 올리면 컨트롤이 시트를 따라 올라간다. */
export const DetailSheetHalf: Story = {
  args: { detailSheetStage: "half" },
};

/** 가로 모드처럼 낮은 화면에서는 컨트롤이 검색 바를 덮지 않도록 잘린다. */
export const ShortViewportWithDetailSheetHalf: Story = {
  args: { viewportHeight: 390, detailSheetStage: "half" },
};
