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
      titleText: "로그인이 확인되었습니다",
    },
    failure: {
      titleText: "로그인에 실패했습니다",
    },
  };

  if (!type) return null;

  return (
    <Popup
      isOpen={isOpen}
      onOpenChange={(val) => !val && close()}
      titleText={config[type].titleText}
      primaryAction={{
        label: "확인",
        onPress: close,
      }}
    />
  );
};
