import type { Meta, StoryObj } from "@storybook/react";
import { vars } from "@repo/ui/vars";
import { setLanguageTag } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchFilterBottomSheet } from "./SearchFilterBottomSheet.tsx";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "Product/Search/Filter Bottom Sheet",
  component: SearchFilterBottomSheet,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      // 영어로 강제 설정
      setLanguageTag("en");
      return (
        <QueryClientProvider client={storyQueryClient}>
          <div
            style={{
              width: vars.layout.containerWidth,
              margin: "0 auto",
              minHeight: "100dvh",
              background: "#f5f5f5",
              position: "relative",
            }}
          >
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof SearchFilterBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
};
