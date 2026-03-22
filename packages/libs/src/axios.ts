import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

/**
 * API 클라이언트 생성 함수
 * - baseURL을 외부에서 주입받아 axios 인스턴스 생성
 *
 * @param baseURL - API 기본 URL (기본값: "/api")
 * @returns axios 인스턴스
 */
export const createApiClient = (baseURL = "/api") => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * 요청 인터셉터
   * - API 요청 전에 실행됨
   * - 인증 토큰, 커스텀 헤더 등을 추가할 수 있음
   */
  client.interceptors.request.use(
    (config) => {
      // 필요 시 인증 토큰 추가
      // const token = getAuthToken()
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
      return config;
    },
    (error) => {
      // 요청 에러 처리
      return Promise.reject(error);
    },
  );

  /**
   * 응답 인터셉터
   * - API 응답 후에 실행됨
   * - 전역 에러 처리, 토큰 갱신 등을 수행할 수 있음
   */
  client.interceptors.response.use(
    (response) => {
      // 응답 데이터 가공 또는 로깅
      return response;
    },
    (error) => {
      // 401 인증 실패 등 에러 처리
      // if (error.response?.status === 401) {
      // }
      return Promise.reject(error);
    },
  );

  return client;
};

/**
 * API 메서드 팩토리 함수
 * - 주입된 axios 인스턴스를 기반으로 타입 안전한 HTTP 메서드 생성
 * - 제네릭을 통해 요청/응답 타입 지정 가능
 *
 * @param client - axios 인스턴스
 * @returns HTTP 메서드 객체 (get, post, put, patch, delete)
 */
export const createApiMethods = (client: AxiosInstance) => {
  return {
    /**
     * GET 요청
     * @template T - 응답 데이터 타입
     */
    httpGet: async <T>(url: string, config?: AxiosRequestConfig) => {
      return client.get<T>(url, config);
    },
    /**
     * POST 요청
     * @template T - 응답 데이터 타입
     * @template D - 요청 body 타입
     */
    httpPost: <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      return client.post<T>(url, data, config);
    },
    /**
     * PUT 요청
     * @template T - 응답 데이터 타입
     * @template D - 요청 body 타입
     */
    httpPut: <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      return client.put<T>(url, data, config);
    },
    /**
     * PATCH 요청
     * @template T - 응답 데이터 타입
     * @template D - 요청 body 타입
     */
    httpPatch: <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      return client.patch<T>(url, data, config);
    },
    /**
     * DELETE 요청
     * @template T - 응답 데이터 타입
     */
    httpDelete: <T>(url: string, config?: AxiosRequestConfig) => {
      return client.delete<T>(url, config);
    },
  };
};
