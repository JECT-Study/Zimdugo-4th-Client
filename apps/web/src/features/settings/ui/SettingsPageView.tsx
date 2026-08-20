import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import {
  IconCircleboxPencil32,
  IconSocialProvider18,
  type SocialProvider,
} from "@repo/ui/tokens/icons";
import type { ChangeEvent, RefObject } from "react";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
import {
  activityGroup,
  content,
  emailField,
  emailProviderList,
  emailText,
  group,
  groupGap,
  header,
  hiddenFileInput,
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
  email: string;
  providers?: SocialProvider[];
  isGuest?: boolean;
  profileImageUrl?: string;
  isUpdatingProfileImage?: boolean;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  profileImageButtonRef?: RefObject<HTMLButtonElement | null>;
  onProfileImagePress: () => void;
  onProfileImageEditPress: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFavoritesPress: () => void;
  onReportsPress: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export interface SettingsPageViewProps {
  profile?: SettingsProfile;
  appVersion: string;
  onBack: () => void;
  onLanguagePress: () => void;
  onThemePress?: () => void;
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
  onThemePress,
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
              <div className={emailField}>
                {profile.providers?.length ? (
                  <span className={emailProviderList}>
                    {profile.providers.map((provider) => (
                      <span key={provider} data-social-provider={provider}>
                        <IconSocialProvider18 provider={provider} />
                      </span>
                    ))}
                  </span>
                ) : null}
                <input
                  className={emailText}
                  type="text"
                  value={profile.email}
                  readOnly
                  aria-label={m.settings_profile_email_aria()}
                />
              </div>
            </section>

            <section className={[group, groupGap].join(" ")}>
              <SettingsRow
                label={m.settings_language()}
                onPress={onLanguagePress}
              />
              <SettingsRow
                label={m.settings_dark_mode()}
                onPress={onThemePress}
              />
            </section>

            <section
              className={[group, activityGroup].join(" ")}
              aria-label={m.my_activity_aria()}
            >
              {!isGuest ? (
                <>
                  <SettingsRow
                    label={m.my_menu_favorite()}
                    onPress={profile.onFavoritesPress}
                  />
                  <SettingsRow
                    label={m.my_menu_report_history()}
                    onPress={profile.onReportsPress}
                  />
                </>
              ) : null}
              <SettingsRow
                label={isGuest ? m.my_login() : m.my_logout()}
                onPress={isGuest ? profile.onLogin : profile.onLogout}
              />
            </section>
          </>
        ) : (
          <section className={group}>
            <SettingsRow
              label={m.settings_language()}
              onPress={onLanguagePress}
            />
            <SettingsRow
              label={m.settings_dark_mode()}
              onPress={onThemePress}
            />
          </section>
        )}

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
      </main>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  return (
    <button
      type="button"
      className={[rowButton, settingRow].join(" ")}
      aria-label={label}
      onClick={onPress}
      disabled={!onPress}
    >
      <span className={settingRowText}>{label}</span>
      {value ? <span className={settingRowValue}>{value}</span> : null}
    </button>
  );
}
