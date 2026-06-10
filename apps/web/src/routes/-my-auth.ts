import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/shared/store/authStore";

export const requireAuthenticatedMyRoute = ({
  location,
  preload,
}: {
  location: { pathname: string };
  preload?: boolean;
}) => {
  if (!useAuthStore.getState().isAuthenticated) {
    if (typeof window !== "undefined" && !preload) {
      import("#/shared/store/authPopupStore").then((module) =>
        module.useAuthPopupStore.getState().openPopup(location.pathname),
      );
    }
    throw redirect({
      to: "/",
      replace: true,
    });
  }
};
