import { m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "#/entities/user/hooks/useUser";
import { useMyPageSummary } from "#/features/my/hooks/useMyPageSummary";
import { useProfileImageChange } from "#/features/my/hooks/useProfileImageChange";
import { useUpdateMeProfile } from "#/features/my/hooks/useUpdateMeProfile";
import { resolveMyPageNickname } from "#/features/my/lib/resolve-my-page-nickname";
import { useAuth } from "#/shared/hooks/useAuth";
import { useAuthStore } from "#/shared/store/authStore";
import { MyPageSkeleton } from "./-MyPageSkeleton";
import { MyPageView } from "./-MyPageView";
import { requireAuthenticatedMyRoute } from "./-my-auth";

export const Route = createFileRoute("/my")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyPage,
});

function MyPage() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const normalizedPath =
    pathname.replace(/^\/(?:ko|en|ja|zh)(?=\/|$)/, "") || "/";
  const isMyRoot = normalizedPath === "/my";

  return isMyRoot ? <MyRootPage /> : <Outlet />;
}

function MyRootPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.email);
  const { data: profile, isPending: isProfilePending } = useUser(userId);
  const { data: summary, isPending: isSummaryPending } = useMyPageSummary();
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

  useEffect(() => {
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
  }, [profile?.nickname, email, isProfilePending]);

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

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleLogout = () => {
    logout();
  };

  const handleOpenFavorites = () => {
    navigate({ to: "/my/favorites" });
  };

  const handleOpenReports = () => {
    navigate({ to: "/my/reports" });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (userId == null || isProfilePending || !isNicknameInitialized) {
    return <MyPageSkeleton />;
  }

  return (
    <>
      <MyPageView
        nickname={nicknameDraft}
        profileImageUrl={profile?.profileImageUrl}
        favoriteCount={summary?.favoriteLockerCount ?? 0}
        reportCount={summary?.lockerReportCount ?? 0}
        isSummaryPending={isSummaryPending}
        isUpdatingProfileImage={isUpdatingProfileImage}
        fileInputRef={fileInputRef}
        onBack={handleBack}
        onProfileImagePress={openConfirmPopup}
        onFileChange={(event) => {
          void handleFileChange(event);
        }}
        onNicknameChange={setNicknameDraft}
        onNicknameBlur={handleNicknameBlur}
        onFavoritesPress={handleOpenFavorites}
        onReportsPress={handleOpenReports}
        onLogout={handleLogout}
      />

      <Popup
        isOpen={isConfirmPopupOpen}
        onOpenChange={setIsConfirmPopupOpen}
        titleText={m.my_profile_image_change_title()}
        helperText={m.my_profile_image_change_helper()}
        primaryAction={{
          label: m.my_profile_image_change_confirm(),
          onPress: handleConfirmChange,
        }}
        secondaryAction={{
          label: m.my_profile_image_change_cancel(),
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
    </>
  );
}
