import { m } from "@repo/i18n";
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
      titleText={m.auth_required_title()}
      primaryAction={{
        label: m.auth_required_login(),
        onPress: () => {
          closePopup();
          navigate({
            to: "/login",
            search: { returnPath, code: undefined },
          });
        },
      }}
      secondaryAction={{
        label: m.common_cancel(),
        onPress: closePopup,
      }}
    />
  );
}
