export const DEFAULT_RETURN_PATH = "/";

/**
 * 로그인 완료 후 되돌아갈 경로를 안전한 내부 경로로 정규화합니다.
 * 외부 절대 URL(`//evil.com`, `https://evil.com`)로의 오픈 리다이렉트를 차단합니다.
 */
export const resolveSafeReturnPath = (returnPath: unknown): string => {
  if (typeof returnPath !== "string") {
    return DEFAULT_RETURN_PATH;
  }

  if (
    !returnPath.startsWith("/") ||
    returnPath.startsWith("//") ||
    returnPath.includes("://")
  ) {
    return DEFAULT_RETURN_PATH;
  }

  return returnPath;
};
