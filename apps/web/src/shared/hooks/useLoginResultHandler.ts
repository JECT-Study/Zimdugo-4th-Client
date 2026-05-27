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
        // 주소창에서 지저분한 code 파라미터를 즉시 제거합니다 (현재 라우트 유지).
        navigate({ 
          to: ".", 
          search: (prev: any) => {
            const { code, ...rest } = prev;
            return rest;
          }, 
          replace: true 
        });

        if (code === "LOGIN_SUCCESS") {
          try {
            // 소셜 인증 후 받아온 쿠키(RT)를 이용해 즉시 AT 발급 시도
            const authData = await authService.refresh();
            useAuthStore.getState().setAuth(authData);
            
            // 성공 시: 즉시 목적지(없으면 메인 "/")로 이동 후 팝업 표출
            navigate({ to: returnPath as any, replace: true });
            useLoginResultStore.getState().open("success");
          } catch (error) {
            handleFailure(returnPath, navigate);
          }
        } else if (code === "LOGIN_FAILED") {
          handleFailure(returnPath, navigate);
        }
      };

      handleLoginResult();
    }
  }, [code, navigate, returnPath]);
};

// ... 외부 헬퍼 함수
function handleFailure(returnPath: string, navigate: any) {
  useLoginResultStore.getState().open("failure");
  
  // 만약 소셜 로그인 콜백이 /login이 아닌 엉뚱한 곳으로 떨어졌다면 /login으로 돌려보냄
  if (window.location.pathname !== "/login") {
    navigate({ to: "/login", search: { returnPath }, replace: true });
  }
}
