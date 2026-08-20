import { vars } from "@repo/ui/vars";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsPageView } from "./SettingsPageView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const PROFILE_IMAGE_URL = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <rect width="240" height="240" fill="#DDF5ED" />
    <circle cx="120" cy="92" r="46" fill="#6BC6A6" />
    <path d="M42 230c8-55 38-84 78-84s70 29 78 84" fill="#45A884" />
  </svg>
`)}`;

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
      favoriteCount: 12,
      reportCount: 3,
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
