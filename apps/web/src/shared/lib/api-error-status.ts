import { isAxiosError } from "axios";

/**
 * API 가 "그런 자원은 없다"(404)고 답한 오류인지.
 *
 * 응답을 받지 못한 오류(네트워크, 시간 초과)나 5xx 는 아니다. 그 경우는 자원이
 * 있는지 알 수 없으므로 없다고 단정하면 안 된다.
 */
export const isApiNotFoundError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;
