/**
 * 신고 접수 실패를 사용자에게 보여줄 갈래로 나눈다.
 *
 * 서버는 검증 실패에 한국어 문장을 담아 보내지만(`validationErrors[].message`),
 * 그대로 노출하면 로케일이 어긋나므로 갈래만 뽑고 문구는 i18n 에서 고른다.
 * 이 엔드포인트는 비로그인도 허용하므로 401 갈래는 두지 않는다.
 */
export type LockerIssueReportFailure = "not-found" | "invalid" | "server";

type HttpLikeError = {
  response?: {
    status?: number;
  };
};

const isHttpLikeError = (error: unknown): error is HttpLikeError =>
  typeof error === "object" && error !== null && "response" in error;

export const parseLockerIssueReportFailure = (
  error: unknown,
): LockerIssueReportFailure => {
  if (!isHttpLikeError(error)) {
    return "server";
  }

  switch (error.response?.status) {
    case 404:
      return "not-found";
    case 400:
      return "invalid";
    default:
      return "server";
  }
};
