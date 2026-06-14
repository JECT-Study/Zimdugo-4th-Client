import { m } from "@repo/i18n";
import { useEffect } from "react";
import { Popup } from "@repo/ui/components/popup";
import { useLoginResultStore } from "#/shared/store/loginResultStore";

export function LoginResultModal() {
  const { isOpen, type, close } = useLoginResultStore();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        close();
      }, 2000); // 2초 후 자동 닫힘
      return () => clearTimeout(timer);
    }
  }, [isOpen, close]);

  useEffect(() => {
    return () => {
      useLoginResultStore.getState().forceClose();
    };
  }, []);

  const config = {
    success: {
      titleText: m.login_result_success_title(),
    },
    failure: {
      titleText: m.login_result_failure_title(),
    },
  };

  if (!type) return null;

  return (
    <Popup
      isOpen={isOpen}
      onOpenChange={(val) => !val && close()}
      titleText={config[type].titleText}
      primaryAction={{
        label: m.common_confirm(),
        onPress: close,
      }}
    />
  );
}
