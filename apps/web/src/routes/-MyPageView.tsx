import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import type { ChangeEvent, RefObject } from "react";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
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

interface MenuRowProps {
  label: string;
  countLabel: string;
  onPress: () => void;
}

function MenuRow({ label, countLabel, onPress }: MenuRowProps) {
  return (
    <button type="button" className={menuRow} onClick={onPress}>
      <span className={menuRowLabel}>{label}</span>
      <span className={menuRowCount}>{countLabel}</span>
    </button>
  );
}

export interface MyPageViewProps {
  nickname: string;
  profileImageUrl?: string;
  favoriteCount: number;
  reportCount: number;
  isSummaryPending?: boolean;
  isUpdatingProfileImage?: boolean;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  onBack: () => void;
  onProfileImagePress: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNicknameChange: (nickname: string) => void;
  onNicknameBlur: () => void;
  onFavoritesPress: () => void;
  onReportsPress: () => void;
  onLogout: () => void;
}

export function MyPageView({
  nickname,
  profileImageUrl,
  favoriteCount,
  reportCount,
  isSummaryPending = false,
  isUpdatingProfileImage = false,
  fileInputRef,
  onBack,
  onProfileImagePress,
  onFileChange,
  onNicknameChange,
  onNicknameBlur,
  onFavoritesPress,
  onReportsPress,
  onLogout,
}: MyPageViewProps) {
  const favoriteCountLabel = isSummaryPending
    ? m.my_summary_loading()
    : m.my_summary_favorite_count({ count: String(favoriteCount) });
  const reportCountLabel = isSummaryPending
    ? m.my_summary_loading()
    : m.my_summary_report_count({ count: String(reportCount) });

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_page_title()}
        onBack={onBack}
      />

      <main className={content}>
        <section className={profileSection} aria-label={m.my_profile_aria()}>
          <button
            type="button"
            className={profileImageButton}
            aria-label={m.my_profile_image_change_aria()}
            onClick={onProfileImagePress}
            disabled={isUpdatingProfileImage}
          >
            <ProfileImage
              src={profileImageUrl}
              size={111}
              alt={m.my_profile_image_alt()}
            />
          </button>
          <input
            ref={fileInputRef}
            className={hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            onChange={onFileChange}
          />
          <input
            className={nameField}
            type="text"
            value={nickname}
            placeholder={m.my_name_placeholder()}
            aria-label={m.my_nickname_input_aria()}
            onChange={(event) => onNicknameChange(event.target.value)}
            onBlur={onNicknameBlur}
          />
        </section>

        <section className={menuGroup} aria-label={m.my_activity_aria()}>
          <MenuRow
            label={m.my_menu_favorite()}
            countLabel={favoriteCountLabel}
            onPress={onFavoritesPress}
          />
          <MenuRow
            label={m.my_menu_report_history()}
            countLabel={reportCountLabel}
            onPress={onReportsPress}
          />
        </section>

        <div className={logoutSlot}>
          <Button
            variant="filled"
            intent="neutral"
            size="L"
            className={logoutButton}
            onPress={onLogout}
          >
            {m.my_logout()}
          </Button>
        </div>
      </main>
    </div>
  );
}
