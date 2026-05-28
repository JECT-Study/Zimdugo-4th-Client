import { useAuth } from "#/shared/hooks/useAuth";

/** 소셜 로그인을 처리하는 액션 훅 */
export function useSocialLogin() {
  const { login } = useAuth();
  
  return {
    mutate: (provider: "naver" | "kakao" | "google", returnPath?: string) => {
      login(provider, returnPath);
    },
    isPending: false, // 페이지 리다이렉트가 일어나므로 굳이 pending 상태가 필요하지 않습니다.
  };
}
