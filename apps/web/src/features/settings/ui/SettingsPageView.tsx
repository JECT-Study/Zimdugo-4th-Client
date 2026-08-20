import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { IconCircleboxPencil32 } from "@repo/ui/tokens/icons";
import type { ChangeEvent, RefObject } from "react";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
import {
  activityGroup,
  content,
  group,
  groupGap,
  header,
  hiddenFileInput,
  logoutButton,
  logoutSlot,
  nameField,
  page,
  profileImageButton,
  profileImageControl,
  profileImageEditButton,
  profileImageEditIcon,
  profileSection,
  rowButton,
  settingRow,
  settingRowText,
  settingRowValue,
  versionText,
} from "./settings.css.ts";

interface SettingsProfile {
  nickname: string;
  isGuest?: boolean;
  profileImageUrl?: string;
  isUpdatingProfileImage?: boolean;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  profileImageButtonRef?: RefObject<HTMLButtonElement | null>;
  onProfileImagePress: () => void;
  onProfileImageEditPress: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNicknameChange: (nickname: string) => void;
  onNicknameBlur: () => void;
  onFavoritesPress: () => void;
  onReportsPress: () => void;
  onLogout: () => void;
}

export interface SettingsPageViewProps {
  profile?: SettingsProfile;
  appVersion: string;
  onBack: () => void;
  onLanguagePress: () => void;
  onNoticePress: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
  onWithdrawPress?: () => void;
}

export function SettingsPageView({
  profile,
  appVersion,
  onBack,
  onLanguagePress,
  onNoticePress,
  onTermsPress,
  onPrivacyPress,
  onWithdrawPress,
}: SettingsPageViewProps) {
  const isGuest = profile?.isGuest ?? false;

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.settings_title()}
        onBack={onBack}
      />

      <main className={content}>
        {profile ? (
          <>
            <section
              className={profileSection}
              aria-label={m.my_profile_aria()}
            >
              <div className={profileImageControl}>
                <button
                  ref={profile.profileImageButtonRef}
                  type="button"
                  className={profileImageButton}
                  aria-label={
                    isGuest ? m.auth_required_login() : m.my_profile_image_alt()
                  }
                  onClick={profile.onProfileImagePress}
                  disabled={!isGuest && !profile.profileImageUrl}
                >
                  <ProfileImage
                    src={profile.profileImageUrl}
                    size={111}
                    placeholderTone={isGuest ? "guest" : "default"}
                    alt={m.my_profile_image_alt()}
                  />
                </button>
                {!isGuest ? (
                  <button
                    type="button"
                    className={profileImageEditButton}
                    aria-label={m.my_profile_image_change_aria()}
                    onClick={profile.onProfileImageEditPress}
                    disabled={profile.isUpdatingProfileImage}
                  >
                    <IconCircleboxPencil32 className={profileImageEditIcon} />
                  </button>
                ) : null}
              </div>
              <input
                ref={profile.fileInputRef}
                className={hiddenFileInput}
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={profile.onFileChange}
              />
              <input
                className={nameField}
                type="text"
                value={profile.nickname}
                readOnly={isGuest}
                placeholder={m.my_name_placeholder()}
                aria-label={m.my_nickname_input_aria()}
                onChange={(event) =>
                  profile.onNicknameChange(event.target.value)
                }
                onBlur={profile.onNicknameBlur}
              />
            </section>

            {!isGuest ? (
              <section
                className={[group, activityGroup].join(" ")}
                aria-label={m.my_activity_aria()}
              >
                <SettingsRow
                  label={m.my_menu_favorite()}
                  onPress={profile.onFavoritesPress}
                />
                <SettingsRow
                  label={m.my_menu_report_history()}
                  onPress={profile.onReportsPress}
                />
              </section>
            ) : null}
          </>
        ) : null}

        <section className={[group, profile ? groupGap : ""].join(" ")}>
          <SettingsRow
            label={m.settings_language()}
            onPress={onLanguagePress}
          />
        </section>

        <section className={[group, groupGap].join(" ")}>
          <SettingsRow label={m.settings_notice()} onPress={onNoticePress} />
          <SettingsRow label={m.settings_terms()} onPress={onTermsPress} />
          <SettingsRow label={m.settings_privacy()} onPress={onPrivacyPress} />
          {onWithdrawPress ? (
            <SettingsRow
              label={m.settings_withdraw()}
              onPress={onWithdrawPress}
            />
          ) : null}
        </section>

        <p className={versionText}>
          {m.settings_version_prefix()} {appVersion}
        </p>

        {profile && !isGuest ? (
          <div className={logoutSlot}>
            <Button
              variant="filled"
              intent="neutral"
              size="L"
              className={logoutButton}
              onPress={profile.onLogout}
            >
              {m.my_logout()}
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress: () => void;
}

function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  return (
    <button
      type="button"
      className={[rowButton, settingRow].join(" ")}
      aria-label={label}
      onClick={onPress}
    >
      <span className={settingRowText}>{label}</span>
      {value ? <span className={settingRowValue}>{value}</span> : null}
    </button>
  );
}
