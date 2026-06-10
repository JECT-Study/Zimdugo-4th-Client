import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileImage } from "./ProfileImage.tsx";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "Entities/User/ProfileImage",
  component: ProfileImage,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={storyQueryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    src: "https://picsum.photos/200",
    alt: "프로필 이미지",
    size: 111,
  },
} satisfies Meta<typeof ProfileImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
  args: {
    src: undefined,
  },
};

export const SmallSize: Story = {
  args: {
    size: 48,
  },
};
