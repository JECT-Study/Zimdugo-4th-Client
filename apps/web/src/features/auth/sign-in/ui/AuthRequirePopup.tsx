import { Popup } from "@repo/ui/components/popup";
import { useNavigate } from "@tanstack/react-router";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";

export function AuthRequirePopup() {
  const { isOpen, returnPath, closePopup } = useAuthPopupStore();
  const navigate = useNavigate();

  return (
    <Popup
      isOpen={isOpen}
      onOpenChange={(val) => !val && closePopup()}
      titleText="로그인이 필요한 기능입니다"
      primaryAction={{
        label: "로그인하기",
        onPress: () => {
          closePopup();
          navigate({
            to: "/login",
            search: { returnPath },
          });
        },
      }}
      secondaryAction={{
        label: "취소",
        onPress: closePopup,
      }}
    />
  );
}
