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
        if (code === "LOGIN_SUCCESS") {
          try {
            // 소셜 인증 후 받아온 쿠키(RT)를 이용해 즉시 AT 발급 시도
            const authData = await authService.refresh();
            useAuthStore.getState().setAuth(authData);
            
            // 성공 시: 즉시 목적지(없으면 메인 "/")로 완전히 이동한 후 팝업 표출
            await navigate({ to: returnPath as any, replace: true });
            useLoginResultStore.getState().open("success");
          } catch (error: any) {
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
  
  // 실패 시에는 사용자가 다시 로그인할 수 있도록 무조건 로그인 폼을 보여주어야 하므로
  // URL에서 code 파라미터를 제거하고 /login 경로로 렌더링을 갱신합니다.
  navigate({ to: "/login", search: { returnPath }, replace: true });
}
