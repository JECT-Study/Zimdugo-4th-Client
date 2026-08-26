import {
  IconNavigationCrosshair24,
  IconNavigationRefresh24,
} from "@repo/ui/tokens/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolveDetailSheetVisibleHeight } from "#/composites/locker-detail/LockerDetailBottomSheet";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import { MAP_CONTROL_FALLBACK_BOTTOM_PX } from "#/entities/map/ui/map-control-stack-fallback";
import {
  locationButton,
  locationControlStack,
  myLocationIcon,
} from "#/routes/-index.css";
import { resolveMapControlBottomPx } from "#/routes/-map-control-visibility";
import { HomeHeader } from "./HomeHeader";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface HomeMapChromePreviewProps {
  /** 세로로 짧은 화면(가로 모드)에서 컨트롤이 검색 바를 덮지 않는지 보기 위한 값 */
  viewportHeight?: number;
  /** 열려 있는 상세 시트 단계. 컨트롤이 시트를 따라 올라간다. */
  detailSheetStage?: "mini" | "half" | "full" | "dismiss";
}

function HomeMapChromePreview({
  viewportHeight = 720,
  detailSheetStage = "dismiss",
}: HomeMapChromePreviewProps) {
  const controlBottom = resolveMapControlBottomPx({
    baseBottomPx: MAP_CONTROL_FALLBACK_BOTTOM_PX,
    sheetVisibleHeightPx: resolveDetailSheetVisibleHeight(detailSheetStage),
    windowHeightPx: viewportHeight,
  });

  return (
    <QueryClientProvider client={storyQueryClient}>
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
        <HomeHeader profileImageUrl="" onProfilePress={() => undefined} />
        <HomeSearchBar onOpenSearch={() => undefined} />
        {/* null 은 놓을 자리가 없다는 뜻이다. 실제 앱도 이때 렌더하지 않는다. */}
        {controlBottom !== null && (
          <div
            className={locationControlStack}
            style={{ bottom: controlBottom }}
          >
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

/** 상세 시트를 하프로 올리면 컨트롤이 시트를 따라 올라간다. */
export const DetailSheetHalf: Story = {
  args: { detailSheetStage: "half" },
};

/** 가로 모드처럼 낮은 화면에서는 컨트롤이 검색 바를 덮지 않도록 잘린다. */
export const ShortViewportWithDetailSheetHalf: Story = {
  args: { viewportHeight: 390, detailSheetStage: "half" },
};
