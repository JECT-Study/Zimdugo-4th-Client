import {
  IconNavigationCrosshair24,
  IconNavigationRefresh24,
} from "@repo/ui/tokens/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import {
  locationButton,
  locationControlStack,
  myLocationIcon,
} from "#/routes/-index.css";
import { HomeHeader } from "./HomeHeader";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function HomeMapChromePreview() {
  return (
    <QueryClientProvider client={storyQueryClient}>
      <main
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          height: "100vh",
          minHeight: 720,
          margin: "0 auto",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #e4eadf 0%, #f0eee4 48%, #dce7e9 100%)",
        }}
      >
        <HomeHeader profileImageUrl="" onProfilePress={() => undefined} />
        <HomeSearchBar onOpenSearch={() => undefined} />
        <div className={locationControlStack}>
          <button
            type="button"
            className={locationButton}
            aria-label="지도 새로고침"
          >
            <IconNavigationRefresh24 />
          </button>
          <button type="button" className={locationButton} aria-label="내 위치">
            <IconNavigationCrosshair24 className={myLocationIcon} />
          </button>
        </div>
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
