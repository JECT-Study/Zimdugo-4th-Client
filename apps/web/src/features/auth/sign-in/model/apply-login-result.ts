import type { QueryClient } from "@tanstack/react-query";
import type { useNavigate } from "@tanstack/react-router";
import { authService } from "#/features/auth/sign-in/api/authService";
import { invalidatePersonalizedQueries } from "#/shared/lib/invalidate-personalized-queries";
import { useAuthStore } from "#/shared/store/authStore";
import { useLoginResultStore } from "#/shared/store/loginResultStore";

type Navigate = ReturnType<typeof useNavigate>;

interface ApplyLoginResultOptions {
  code: string;
  returnPath: string;
  navigate: Navigate;
  queryClient: QueryClient;
}

/**
 * 서버가 돌려준 로그인 결과(`code`)를 반영한다.
 *
 * 같은 창으로 돌아온 결과와, 팝업이 알려 온 결과가 모두 여기를 거친다.
 */
export const applyLoginResult = async ({
  code,
  returnPath,
  navigate,
  queryClient,
}: ApplyLoginResultOptions) => {
  if (code !== "LOGIN_SUCCESS") {
    // LOGIN_FAILED 와, 처리되지 않은 채 URL 에 남아 무한 대기하지 않도록
    // 알 수 없는 code 도 실패로 본다.
    handleFailure(returnPath, navigate);
    return;
  }

  try {
    // 소셜 인증 후 받아온 쿠키(RT)를 이용해 즉시 AT 발급 시도
    const authData = await authService.refresh();
    useAuthStore.getState().setAuth(authData);
    await invalidatePersonalizedQueries(queryClient);

    // 목적지로 완전히 이동한 뒤 결과를 알린다.
    await navigate({ to: returnPath as never, replace: true });
    useLoginResultStore.getState().open("success");
  } catch {
    handleFailure(returnPath, navigate);
  }
};

function handleFailure(returnPath: string, navigate: Navigate) {
  // 이미 로그인한 사용자가 뒤로가기로 히스토리에 남은 제공자 페이지에 돌아가
  // 다시 누르면, 서버의 인증 요청은 이미 소멸해 LOGIN_FAILED 로 돌아온다.
  // 로그인 상태는 그대로이므로 실패를 알리지 않고 목적지로만 보낸다.
  // refresh 실패는 authService 가 먼저 로그인 상태를 지우므로 여기서 걸러지지 않는다.
  if (useAuthStore.getState().isAuthenticated) {
    navigate({ to: returnPath as never, replace: true });
    return;
  }

  useLoginResultStore.getState().open("failure");

  // 다시 로그인할 수 있도록 로그인 화면을 보여 준다. URL 에서 code 를 지워
  // 같은 결과를 다시 처리하지 않게 한다.
  navigate({
    to: "/login",
    search: { returnPath, code: undefined },
    replace: true,
  });
}
