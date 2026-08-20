import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OriginalImagePreview } from "#/shared/ui/OriginalImagePreview";
import {
  SettingsPageView,
  type SettingsPageViewProps,
} from "./SettingsPageView";

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
            width: vars.layout.tabletAppMaxWidth,
            maxWidth: "100%",
            height: "100dvh",
            margin: "0 auto",
            overflow: "hidden",
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
    onThemePress: undefined,
    onNoticePress: () => undefined,
    onTermsPress: () => undefined,
    onPrivacyPress: () => undefined,
    onWithdrawPress: () => undefined,
    profile: {
      email: "zimdugo@gmail.com",
      providers: ["google"],
      profileImageUrl: PROFILE_IMAGE_URL,
      onProfileImagePress: () => undefined,
      onProfileImageEditPress: () => undefined,
      onFileChange: () => undefined,
      onFavoritesPress: () => undefined,
      onReportsPress: () => undefined,
      onLogin: () => undefined,
      onLogout: () => undefined,
    },
  },
  render: (args) => <SettingsPageStory {...args} />,
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
    profile: {
      ...meta.args.profile,
      isGuest: true,
      email: "게스트",
      providers: [],
      profileImageUrl: undefined,
    },
    onWithdrawPress: undefined,
  },
};

function SettingsPageStory(args: SettingsPageViewProps) {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const profile = args.profile;

  const handleProfileImagePress = () => {
    if (profile?.isGuest || !profile?.profileImageUrl) {
      profile?.onProfileImagePress();
      return;
    }

    setPreviewImageUrl(profile.profileImageUrl);
  };

  return (
    <>
      <SettingsPageView
        {...args}
        profile={
          profile
            ? {
                ...profile,
                onProfileImagePress: handleProfileImagePress,
                onLogout: () => setIsLogoutPopupOpen(true),
              }
            : undefined
        }
      />
      {previewImageUrl ? (
        <OriginalImagePreview
          imageUrl={previewImageUrl}
          alt={m.my_profile_image_alt()}
          closeLabel={m.search_close_aria()}
          onClose={() => setPreviewImageUrl(null)}
        />
      ) : null}
      <Popup
        isOpen={isLogoutPopupOpen}
        onOpenChange={setIsLogoutPopupOpen}
        titleText={m.my_logout_confirm_title()}
        primaryAction={{
          label: m.common_yes(),
          onPress: () => setIsLogoutPopupOpen(false),
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsLogoutPopupOpen(false),
        }}
      />
    </>
  );
}
