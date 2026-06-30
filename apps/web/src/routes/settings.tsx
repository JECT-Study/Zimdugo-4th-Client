import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { authService } from "#/features/auth/sign-in/api/authService";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import {
  SettingsHeaderSkeleton,
  SettingsSkeleton,
  SettingsSkeletonFrame,
} from "#/features/settings/ui/SettingsRouteSkeleton";
import {
  content,
  group,
  groupGap,
  header,
  page,
  rowButton,
  settingRow,
  settingRowText,
  versionText,
} from "#/features/settings/ui/settings.css.ts";
import {
  settingsContentInlineFallbackStyle,
  settingsGroupGapInlineFallbackStyle,
  settingsGroupInlineFallbackStyle,
  settingsPageInlineFallbackStyle,
  settingsSettingRowInlineFallbackStyle,
} from "#/features/settings/ui/settings-page-fallback";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";
import { removePersonalizedQueries } from "#/shared/lib/invalidate-personalized-queries";
import { useAuthStore } from "#/shared/store/authStore";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

export function SettingsPage() {
  // 1. Hooks
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isWithdrawPopupOpen, setIsWithdrawPopupOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 2. Derived values
  const normalizedPath = stripLocalePathPrefix(pathname);
  const isSettingsRoot = normalizedPath === "/settings";
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady({
    enabled: isSettingsRoot,
  });
  const applyFallbackStyle = isStyleTimedOut;

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

  // 5. Early returns
  if (!isSettingsRoot) {
    return <Outlet />;
  }

  if (!isStyleReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsSkeleton />
      </SettingsSkeletonFrame>
    );
  }

  // 6. JSX return
  return (
    <div
      className={page}
      style={applyFallbackStyle ? settingsPageInlineFallbackStyle : undefined}
    >
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.settings_title()}
        onBack={() => navigate({ to: "/" })}
      />

      <main
        className={content}
        style={
          applyFallbackStyle ? settingsContentInlineFallbackStyle : undefined
        }
      >
        <section
          className={group}
          style={
            applyFallbackStyle ? settingsGroupInlineFallbackStyle : undefined
          }
        >
          <SettingRow
            label={m.settings_language()}
            onClick={() => navigate({ to: "/settings/language" })}
            applyFallbackStyle={applyFallbackStyle}
          />
          {/* Theme settings are hidden until the dark-mode rollout decision is made. */}
          {/* <SettingRow label={m.settings_dark_mode()} /> */}
        </section>

        <section
          className={[group, groupGap].join(" ")}
          style={
            applyFallbackStyle
              ? {
                  ...settingsGroupInlineFallbackStyle,
                  ...settingsGroupGapInlineFallbackStyle,
                }
              : undefined
          }
        >
          <SettingRow
            label={m.settings_notice()}
            onClick={() => navigate({ to: "/settings/notices" })}
            applyFallbackStyle={applyFallbackStyle}
          />
          <SettingRow
            label={m.settings_terms()}
            onClick={() => navigate({ to: "/settings/terms" })}
            applyFallbackStyle={applyFallbackStyle}
            attached
          />
          <SettingRow
            label={m.settings_privacy()}
            onClick={() => navigate({ to: "/settings/privacy" })}
            applyFallbackStyle={applyFallbackStyle}
            attached
          />
          {isAuthenticated && (
            <SettingRow
              label={m.settings_withdraw()}
              onClick={() => setIsWithdrawPopupOpen(true)}
              applyFallbackStyle={applyFallbackStyle}
              attached
            />
          )}
        </section>

        <p className={versionText}>
          {m.settings_version_prefix()}{" "}
          {import.meta.env.VITE_APP_VERSION || "1.0.0"}
        </p>
      </main>

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
    </div>
  );
}

interface SettingRowProps {
  label: string;
  onClick?: () => void;
  children?: ReactNode;
  applyFallbackStyle?: boolean;
  attached?: boolean;
}

function SettingRow({
  label,
  onClick,
  children,
  applyFallbackStyle = false,
  attached = false,
}: SettingRowProps) {
  return (
    <button
      type="button"
      className={[rowButton, settingRow].join(" ")}
      style={
        applyFallbackStyle
          ? settingsSettingRowInlineFallbackStyle({ attached })
          : undefined
      }
      aria-label={label}
      onClick={onClick}
    >
      <span className={settingRowText}>{label}</span>
      {children}
    </button>
  );
}
