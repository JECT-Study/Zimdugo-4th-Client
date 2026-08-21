export const DEFAULT_RETURN_PATH = "/";

/**
 * 로그인 완료 후 되돌아갈 경로를 안전한 내부 경로로 정규화합니다.
 * 외부 절대 URL(`//evil.com`, `https://evil.com`)로의 오픈 리다이렉트를 차단합니다.
 *
 * 역슬래시는 어디에 있든 거부합니다. WHATWG URL 파서는 special scheme에서
 * `\`를 `/`와 동일하게 처리하므로 `/\evil.com`이 `https://evil.com`으로 해석됩니다.
 * 내부 경로에 역슬래시가 필요한 경우는 없으므로 통째로 막는 편이 안전합니다.
 */
export const resolveSafeReturnPath = (returnPath: unknown): string => {
  if (typeof returnPath !== "string") {
    return DEFAULT_RETURN_PATH;
  }

  if (
    !returnPath.startsWith("/") ||
    returnPath.startsWith("//") ||
    returnPath.includes("\\") ||
    returnPath.includes("://")
  ) {
    return DEFAULT_RETURN_PATH;
  }

  return returnPath;
};
