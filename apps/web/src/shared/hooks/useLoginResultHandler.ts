import { useEffect } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useLoginResultStore } from "../store/loginResultStore";
import { authService } from "../../features/auth/sign-in/api/authService";
import { useAuthStore } from "../store/authStore";

export const useLoginResultHandler = () => {
  const navigate = useNavigate();
  // @tanstack/react-router의 useSearch는 strict: false일 때 location.search 전체를 반환합니다.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const code = search.code as string | undefined;
  const returnPath = (search.returnPath as string) || "/";

  useEffect(() => {
    if (code) {
      const handleLoginResult = async () => {
        // 주소창에서 지저분한 code 파라미터를 즉시 제거합니다.
        navigate({ to: "/login" as any, search: { returnPath }, replace: true });

        if (code === "LOGIN_SUCCESS") {
          try {
            // 소셜 인증 후 받아온 쿠키(RT)를 이용해 즉시 AT 발급 시도
            const authData = await authService.refresh();
            useAuthStore.getState().setAuth(authData);
            
            // 성공 팝업을 띄우고, 팝업이 닫힐 때 리다이렉트 실행
            useLoginResultStore.getState().open("success", () => {
              navigate({ to: returnPath as any, replace: true });
            });
          } catch (error) {
            // 쿠키가 없거나 만료 등 실패 시
            useLoginResultStore.getState().open("failure", () => {
              navigate({ to: "/login" as any, search: { returnPath }, replace: true });
            });
          }
        } else if (code === "LOGIN_FAILED") {
          // 백엔드에서 소셜 인증 자체에 실패한 경우
          useLoginResultStore.getState().open("failure", () => {
            navigate({ to: "/login" as any, search: { returnPath }, replace: true });
          });
        }
      };

      handleLoginResult();
    }
  }, [code, navigate, returnPath]);
};
