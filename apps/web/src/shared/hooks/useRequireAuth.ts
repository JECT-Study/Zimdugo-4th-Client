import { useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      const returnPath = location.pathname + location.searchStr;
      navigate({ to: "/login", search: { returnPath }, replace: true });
    }
  }, [isAuthenticated, location, navigate]);
};
