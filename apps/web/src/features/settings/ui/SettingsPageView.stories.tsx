import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsPageView } from "./SettingsPageView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const PROFILE_IMAGE_URL = "https://picsum.photos/200";

const meta = {
  title: "Product/Pages/Settings/Integrated",
  component: SettingsPageView,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            width: vars.layout.designWidth,
            height: "100dvh",
            margin: "0 auto",
          }}
        >
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: { layout: "fullscreen" },
  args: {
    appVersion: "1.0.0",
    onBack: () => undefined,
    onLanguagePress: () => undefined,
    onNoticePress: () => undefined,
    onTermsPress: () => undefined,
    onPrivacyPress: () => undefined,
    onWithdrawPress: () => undefined,
    profile: {
      nickname: "여정이",
      profileImageUrl: PROFILE_IMAGE_URL,
      onProfileImagePress: () => undefined,
      onFileChange: () => undefined,
      onNicknameChange: () => undefined,
      onNicknameBlur: () => undefined,
      onFavoritesPress: () => undefined,
      onReportsPress: () => undefined,
      onLogout: () => undefined,
    },
  },
} satisfies Meta<typeof SettingsPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {};

export const WithoutProfileImage: Story = {
  args: {
    profile: {
      ...meta.args.profile,
      profileImageUrl: undefined,
    },
  },
};

export const Guest: Story = {
  args: {
    profile: undefined,
    onWithdrawPress: undefined,
  },
};
