import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      const returnPath = location.pathname + location.search;
      navigate(`/login?returnPath=${encodeURIComponent(returnPath)}`, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);
};
