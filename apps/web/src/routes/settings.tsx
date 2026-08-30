import { languageTag, m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useMapColorSchemePreference } from "#/entities/map";
import { useUser } from "#/entities/user/hooks/useUser";
import { authService } from "#/features/auth/sign-in/api/authService";
import { useProfileImageChange } from "#/features/my/hooks/useProfileImageChange";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { resolveSocialProviders } from "#/features/settings/lib/resolve-social-providers";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import { getMapColorSchemeLabel } from "#/features/settings/ui/MapColorSchemeSettingList";
import { SettingsPageView } from "#/features/settings/ui/SettingsPageView";
import {
  SettingsHeaderSkeleton,
  SettingsSkeleton,
  SettingsSkeletonFrame,
} from "#/features/settings/ui/SettingsRouteSkeleton";
import { useAuth } from "#/shared/hooks/useAuth";
import { useBackNavigation } from "#/shared/hooks/useBackNavigation";
import { BASE_LOCALE, stripLocalePathPrefix } from "#/shared/i18n/locales";
import { removePersonalizedQueries } from "#/shared/lib/invalidate-personalized-queries";
import {
  appLanguageLabelMap,
  normalizeLanguage,
} from "#/shared/store/language";
import { OriginalImagePreview } from "#/shared/ui/OriginalImagePreview";

export const Route = createFileRoute("/settings")({
  head: createNoIndexNoFollowHead,
  component: SettingsPage,
});

export function SettingsPage() {
  // 1. Hooks
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAuth();
  const handleBack = useBackNavigation("/");
  const { preference: mapColorSchemePreference } =
    useMapColorSchemePreference();
  const currentLanguageLabel =
    appLanguageLabelMap[normalizeLanguage(languageTag()) ?? BASE_LOCALE];
  const isSettingsRoot = useRouterState({
    select: (state) =>
      stripLocalePathPrefix(state.location.pathname) === "/settings",
  });
  const { data: profile, isPending: isProfilePending } = useUser(
    isAuthenticated && isSettingsRoot,
  );
  const {
    isErrorPopupOpen,
    setIsErrorPopupOpen,
    errorMessage,
    fileInputRef,
    isUpdatingProfileImage,
    openFilePicker,
    handleFileChange,
  } = useProfileImageChange();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isWithdrawPopupOpen, setIsWithdrawPopupOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const profileImageButtonRef = useRef<HTMLButtonElement | null>(null);
  const handleCloseImagePreview = useCallback(() => {
    setPreviewImageUrl(null);
    profileImageButtonRef.current?.focus();
  }, []);

  // 2. Derived values
  const { isStyleReady } = useSettingsStyleReady({ enabled: isSettingsRoot });
  const isProfileReady = !isAuthenticated || !isProfilePending;
  const profileEmail = isAuthenticated
    ? (profile?.email ?? "")
    : m.my_guest_label();

  // 3. Event handlers
  const handleConfirmWithdraw = async () => {
    try {
      await authService.withdraw();
      removePersonalizedQueries(queryClient);
      navigate({ to: "/", replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to withdraw account:", error);
      }
      alert(m.settings_withdraw_failed());
    }
  };

  const handleConfirmLogout = () => {
    void logout();
  };

  const handleLogin = () => {
    void navigate({
      to: "/login",
      search: { returnPath: "/settings", code: undefined },
    });
  };

  const handleProfileImagePress = () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    if (profile?.profileImageUrl) {
      setPreviewImageUrl(profile.profileImageUrl);
    }
  };

  // 5. Early returns
  if (!isSettingsRoot) {
    return <Outlet />;
  }

  if (!isStyleReady || !isProfileReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsSkeleton showProfile isGuest={!isAuthenticated} />
      </SettingsSkeletonFrame>
    );
  }

  // 6. JSX return
  return (
    <>
      <SettingsPageView
        appVersion={import.meta.env.VITE_APP_VERSION || "1.0.0"}
        onBack={handleBack}
        onLanguagePress={() => navigate({ to: "/settings/language" })}
        languageValue={currentLanguageLabel}
        onThemePress={() => navigate({ to: "/settings/theme" })}
        themeValue={getMapColorSchemeLabel(mapColorSchemePreference)}
        onNoticePress={() => navigate({ to: "/notices" })}
        onTermsPress={() => navigate({ to: "/settings/terms" })}
        onPrivacyPress={() => navigate({ to: "/settings/privacy" })}
        onWithdrawPress={
          isAuthenticated ? () => setIsWithdrawPopupOpen(true) : undefined
        }
        profile={{
          isGuest: !isAuthenticated,
          email: profileEmail,
          providers: isAuthenticated
            ? resolveSocialProviders(profile?.providers)
            : [],
          profileImageUrl: profile?.profileImageUrl,
          isUpdatingProfileImage,
          fileInputRef,
          profileImageButtonRef,
          onProfileImagePress: handleProfileImagePress,
          onProfileImageEditPress: openFilePicker,
          onFileChange: (event) => {
            void handleFileChange(event);
          },
          onFavoritesPress: () => navigate({ to: "/my/favorites" }),
          onReportsPress: () => navigate({ to: "/my/reports" }),
          onLogin: handleLogin,
          onLogout: () => setIsLogoutPopupOpen(true),
        }}
      />

      {previewImageUrl ? (
        <OriginalImagePreview
          images={[previewImageUrl]}
          alt={m.my_profile_image_alt()}
          closeLabel={m.my_report_detail_close()}
          onClose={handleCloseImagePreview}
        />
      ) : null}

      <Popup
        isOpen={isLogoutPopupOpen}
        onOpenChange={setIsLogoutPopupOpen}
        titleText={m.my_logout_confirm_title()}
        primaryAction={{
          label: m.common_yes(),
          onPress: handleConfirmLogout,
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsLogoutPopupOpen(false),
        }}
      />

      <Popup
        isOpen={isErrorPopupOpen}
        onOpenChange={setIsErrorPopupOpen}
        titleText={errorMessage}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsErrorPopupOpen(false),
        }}
      />

      <Popup
        isOpen={isWithdrawPopupOpen}
        onOpenChange={setIsWithdrawPopupOpen}
        titleText={m.settings_withdraw_title()}
        helperText={m.settings_withdraw_desc()}
        primaryAction={{
          label: m.settings_withdraw_confirm(),
          onPress: () => {
            void handleConfirmWithdraw();
          },
        }}
        secondaryAction={{
          label: m.settings_withdraw_cancel(),
          onPress: () => setIsWithdrawPopupOpen(false),
        }}
      />
    </>
  );
}
