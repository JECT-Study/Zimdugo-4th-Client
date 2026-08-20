import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "#/entities/user/hooks/useUser";
import { authService } from "#/features/auth/sign-in/api/authService";
import { useProfileImageChange } from "#/features/my/hooks/useProfileImageChange";
import { useUpdateMeProfile } from "#/features/my/hooks/useUpdateMeProfile";
import { resolveMyPageNickname } from "#/features/my/lib/resolve-my-page-nickname";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import { SettingsPageView } from "#/features/settings/ui/SettingsPageView";
import {
  SettingsHeaderSkeleton,
  SettingsSkeleton,
  SettingsSkeletonFrame,
} from "#/features/settings/ui/SettingsRouteSkeleton";
import { useAuth } from "#/shared/hooks/useAuth";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";
import { removePersonalizedQueries } from "#/shared/lib/invalidate-personalized-queries";
import { useAuthStore } from "#/shared/store/authStore";

export const Route = createFileRoute("/settings")({
  head: createNoIndexNoFollowHead,
  component: SettingsPage,
});

export function SettingsPage() {
  // 1. Hooks
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAuth();
  const email = useAuthStore((state) => state.email);
  const isSettingsRoot = useRouterState({
    select: (state) =>
      stripLocalePathPrefix(state.location.pathname) === "/settings",
  });
  const { data: profile, isPending: isProfilePending } = useUser(
    isAuthenticated && isSettingsRoot,
  );
  const { mutate: updateProfile } = useUpdateMeProfile();
  const {
    isConfirmPopupOpen,
    setIsConfirmPopupOpen,
    isErrorPopupOpen,
    setIsErrorPopupOpen,
    errorMessage,
    fileInputRef,
    isUpdatingProfileImage,
    openConfirmPopup,
    handleConfirmChange,
    handleFileChange,
  } = useProfileImageChange();
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [isNicknameInitialized, setIsNicknameInitialized] = useState(false);
  const [isWithdrawPopupOpen, setIsWithdrawPopupOpen] = useState(false);

  // 2. Derived values
  const { isStyleReady } = useSettingsStyleReady({ enabled: isSettingsRoot });
  const isProfileReady =
    !isAuthenticated || (!isProfilePending && isNicknameInitialized);

  // 3. Event handlers
  const handleNicknameBlur = () => {
    const trimmedNickname = nicknameDraft.trim();
    if (!trimmedNickname) {
      setNicknameDraft(
        resolveMyPageNickname({
          profileNickname: profile?.nickname,
          email,
        }),
      );
      return;
    }

    if (trimmedNickname === profile?.nickname) {
      return;
    }

    updateProfile(
      { nickname: trimmedNickname },
      {
        onError: () => {
          setNicknameDraft(
            resolveMyPageNickname({
              profileNickname: profile?.nickname,
              email,
            }),
          );
        },
      },
    );
  };

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

  const handleLogout = () => {
    void logout();
  };

  // 4. Side effects
  useEffect(() => {
    if (!isAuthenticated) {
      setNicknameDraft("");
      setIsNicknameInitialized(false);
      return;
    }

    if (isProfilePending) {
      return;
    }

    setNicknameDraft(
      resolveMyPageNickname({
        profileNickname: profile?.nickname,
        email,
      }),
    );
    setIsNicknameInitialized(true);
  }, [isAuthenticated, isProfilePending, profile?.nickname, email]);

  // 5. Early returns
  if (!isSettingsRoot) {
    return <Outlet />;
  }

  if (!isStyleReady || !isProfileReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsSkeleton showProfile={isAuthenticated} />
      </SettingsSkeletonFrame>
    );
  }

  // 6. JSX return
  return (
    <>
      <SettingsPageView
        appVersion={import.meta.env.VITE_APP_VERSION || "1.0.0"}
        onBack={() => navigate({ to: "/" })}
        onLanguagePress={() => navigate({ to: "/settings/language" })}
        onNoticePress={() => navigate({ to: "/notices" })}
        onTermsPress={() => navigate({ to: "/settings/terms" })}
        onPrivacyPress={() => navigate({ to: "/settings/privacy" })}
        onWithdrawPress={
          isAuthenticated ? () => setIsWithdrawPopupOpen(true) : undefined
        }
        profile={{
          isGuest: !isAuthenticated,
          nickname: isAuthenticated ? nicknameDraft : m.auth_required_title(),
          profileImageUrl: profile?.profileImageUrl,
          isUpdatingProfileImage,
          fileInputRef,
          onProfileImagePress: openConfirmPopup,
          onFileChange: (event) => {
            void handleFileChange(event);
          },
          onNicknameChange: setNicknameDraft,
          onNicknameBlur: handleNicknameBlur,
          onFavoritesPress: () => navigate({ to: "/my/favorites" }),
          onReportsPress: () => navigate({ to: "/my/reports" }),
          onLogout: handleLogout,
        }}
      />

      <Popup
        isOpen={isConfirmPopupOpen}
        onOpenChange={setIsConfirmPopupOpen}
        titleText={m.my_profile_image_change_title()}
        helperText={m.my_profile_image_change_helper()}
        primaryAction={{
          label: m.common_yes(),
          onPress: handleConfirmChange,
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsConfirmPopupOpen(false),
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
