import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { isApiNotFoundError } from "./api-error-status";

const createResponseError = (status: number) =>
  new AxiosError("요청 실패", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
  } as AxiosResponse);

describe("isApiNotFoundError", () => {
  it("API 가 404 로 답한 오류는 없는 자원으로 본다", () => {
    expect(isApiNotFoundError(createResponseError(404))).toBe(true);
  });

  it("5xx 는 자원이 있는지 알 수 없으므로 없는 자원으로 보지 않는다", () => {
    expect(isApiNotFoundError(createResponseError(500))).toBe(false);
    expect(isApiNotFoundError(createResponseError(503))).toBe(false);
  });

  it("응답을 받지 못한 오류는 없는 자원으로 보지 않는다", () => {
    expect(
      isApiNotFoundError(new AxiosError("네트워크 오류", "ERR_NETWORK")),
    ).toBe(false);
  });

  it("axios 오류가 아니면 없는 자원으로 보지 않는다", () => {
    expect(isApiNotFoundError(new Error("404"))).toBe(false);
    expect(isApiNotFoundError({ response: { status: 404 } })).toBe(false);
  });
});
