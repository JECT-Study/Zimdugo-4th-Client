import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "#/entities/user/hooks/useUser";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
import { useProfileImageChange } from "#/features/my/hooks/useProfileImageChange";
import { useUpdateMeProfile } from "#/features/my/hooks/useUpdateMeProfile";
import { useAuth } from "#/shared/hooks/useAuth";
import { useAuthStore } from "#/shared/store/authStore";
import { requireAuthenticatedMyRoute } from "./-my-auth";
import {
  content,
  header,
  hiddenFileInput,
  logoutButton,
  logoutSlot,
  menuGroup,
  menuRow,
  menuRowCount,
  menuRowLabel,
  nameField,
  page,
  profileImageButton,
  profileSection,
} from "./-my.css.ts";

export const Route = createFileRoute("/my")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyPage,
});

interface MenuRowProps {
  label: string;
  countLabel: string;
}

function MenuRow({ label, countLabel }: MenuRowProps) {
  return (
    <div className={menuRow} aria-disabled>
      <span className={menuRowLabel}>{label}</span>
      <span className={menuRowCount}>{countLabel}</span>
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.email);
  const { data: profile, isPending: isProfilePending } = useUser(userId);
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

  useEffect(() => {
    if (profile?.nickname) {
      setNicknameDraft(profile.nickname);
      return;
    }

    if (!isProfilePending) {
      setNicknameDraft(email?.split("@")[0] ?? "");
    }
  }, [profile?.nickname, email, isProfilePending]);

  const handleNicknameBlur = () => {
    const trimmedNickname = nicknameDraft.trim();
    if (!trimmedNickname || trimmedNickname === profile?.nickname) {
      return;
    }

    updateProfile(
      { nickname: trimmedNickname },
      {
        onError: () => {
          setNicknameDraft(
            profile?.nickname ?? email?.split("@")[0] ?? "",
          );
        },
      },
    );
  };

  const favoriteCountLabel = m.my_summary_favorite_count({ count: "0" });
  const reportCountLabel = m.my_summary_report_count({ count: "0" });

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_page_title()}
        onBack={handleBack}
      />

      <main className={content}>
        <section className={profileSection} aria-label={m.my_profile_aria()}>
          <button
            type="button"
            className={profileImageButton}
            aria-label={m.my_profile_image_change_aria()}
            onClick={openConfirmPopup}
            disabled={isUpdatingProfileImage}
          >
            <ProfileImage userId={userId} size={111} alt={m.my_profile_image_alt()} />
          </button>
          <input
            ref={fileInputRef}
            className={hiddenFileInput}
            type="file"
            accept="image/*"
            onChange={(event) => {
              void handleFileChange(event);
            }}
          />
          <input
            className={nameField}
            type="text"
            value={nicknameDraft}
            placeholder={m.my_name_placeholder()}
            aria-label={m.my_nickname_input_aria()}
            onChange={(event) => setNicknameDraft(event.target.value)}
            onBlur={handleNicknameBlur}
          />
        </section>

        <section className={menuGroup} aria-label={m.my_activity_aria()}>
          <MenuRow
            label={m.my_menu_favorite()}
            countLabel={favoriteCountLabel}
          />
          <MenuRow
            label={m.my_menu_report_history()}
            countLabel={reportCountLabel}
          />
        </section>

        <div className={logoutSlot}>
          <Button
            variant="filled"
            intent="neutral"
            size="L"
            className={logoutButton}
            onPress={handleLogout}
          >
            {m.my_logout()}
          </Button>
        </div>
      </main>

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
    </div>
  );
}
