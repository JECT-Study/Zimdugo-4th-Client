import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeHeader } from "./HomeHeader";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "Product/Home/Header",
  component: HomeHeader,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={storyQueryClient}>
        <div
          style={{ position: "relative", minHeight: 180, background: "#eee" }}
        >
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    onProfilePress: () => undefined,
  },
} satisfies Meta<typeof HomeHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GuestAndWithoutProfileImage: Story = {
  args: {
    profileImageUrl: "",
  },
};

export const WithProfileImage: Story = {
  args: {
    profileImageUrl: "https://i.pravatar.cc/160?img=12",
  },
};
