import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeHeader, HomeHeaderSkeleton } from "./HomeHeader";

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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#eee",
          }}
        >
          {/*
            헤더는 position: absolute 라 가장 가까운 위치 지정 조상을 기준으로
            붙는다. 헤더 높이(48px)만큼의 상자를 하나 두고 그 상자를 화면
            정가운데로 보내면, 헤더가 세로 가운데에 놓이고 가로 가운데 정렬은
            헤더 자신의 max-width + margin auto 가 그대로 처리한다.
          */}
          <div style={{ position: "relative", width: "100%", height: 48 }}>
            <Story />
          </div>
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    onProfilePress: () => undefined,
    onLogoPress: () => undefined,
    mapColorScheme: "light",
    onMapColorSchemePress: () => undefined,
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
    profileImageUrl: "https://picsum.photos/200",
  },
};

export const StyleLoadingSkeleton: StoryObj = {
  render: () => <HomeHeaderSkeleton />,
};
