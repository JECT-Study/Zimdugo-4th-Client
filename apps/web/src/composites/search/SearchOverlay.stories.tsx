import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SearchHistoryEntry } from "#/features/search/model/search-history";
import { SearchOverlay } from "./SearchOverlay.tsx";
import { vars } from "@repo/ui/vars";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const sampleRecentEntries: SearchHistoryEntry[] = [
  {
    kind: "keyword",
    id: "keyword:코엑스",
    query: "코엑스",
    searchedAt: "2026-06-09T10:00:00.000Z",
  },
  {
    kind: "locker",
    id: "locker:10",
    lockerId: 10,
    title: "코엑스 보관함",
    searchDraft: "코엑스",
    searchedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    kind: "place",
    id: "place:7",
    placeId: 7,
    title: "코엑스",
    searchDraft: "삼성",
    searchedAt: "2026-06-07T10:00:00.000Z",
  },
];

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
  args: {
    onClose: () => {},
    onSelect: () => {},
    onRemoveRecent: () => {},
    onClearRecent: () => {},
    searchCoordinates: { lat: 37.498095, lng: 127.02761 },
  },
} satisfies Meta<typeof SearchOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
  args: {
    initialQuery: "",
    recentEntries: sampleRecentEntries,
  },
};

export const WithQuery: Story = {
  name: "with query",
  args: {
    initialQuery: "COEX",
    recentEntries: sampleRecentEntries,
  },
};
