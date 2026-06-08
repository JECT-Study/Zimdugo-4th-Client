import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchOverlay } from "./SearchOverlay.tsx";
import { vars } from "@repo/ui/vars";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "Composites/Search/SearchOverlay",
  component: SearchOverlay,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={storyQueryClient}>
        <div
          style={{
            width: vars.layout.containerWidth,
            margin: "0 auto",
            minHeight: "100dvh",
            background: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof SearchOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
  args: {
    initialQuery: "",
    searchCoordinates: { lat: 37.498095, lng: 127.02761 },
  },
};

export const WithQuery: Story = {
  name: "with query",
  args: {
    initialQuery: "COEX",
    searchCoordinates: { lat: 37.498095, lng: 127.02761 },
  },
};
