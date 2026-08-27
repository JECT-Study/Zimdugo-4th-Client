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
    paramsSerializer: {
      indexes: null,
    },
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
 * - 응답 body 를 그대로 돌려준다. AxiosResponse 껍질은 여기서 벗겨지므로
 *   호출부가 axios 를 알 필요가 없다.
 *
 * @param client - axios 인스턴스
 * @returns HTTP 메서드 객체 (get, post, put, patch, delete)
 */
export const createApiMethods = (client: AxiosInstance) => {
  return {
    /**
     * GET 요청
     * @template T - 응답 body 타입
     */
    httpGet: async <T>(url: string, config?: AxiosRequestConfig) => {
      const { data } = await client.get<T>(url, config);
      return data;
    },
    /**
     * POST 요청
     * @template T - 응답 body 타입
     * @template D - 요청 body 타입
     */
    httpPost: async <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post<T>(url, data, config);
      return response.data;
    },
    /**
     * PUT 요청
     * @template T - 응답 body 타입
     * @template D - 요청 body 타입
     */
    httpPut: async <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put<T>(url, data, config);
      return response.data;
    },
    /**
     * PATCH 요청
     * @template T - 응답 body 타입
     * @template D - 요청 body 타입
     */
    httpPatch: async <T, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch<T>(url, data, config);
      return response.data;
    },
    /**
     * DELETE 요청
     * @template T - 응답 body 타입
     */
    httpDelete: async <T>(url: string, config?: AxiosRequestConfig) => {
      const { data } = await client.delete<T>(url, config);
      return data;
    },
  };
};
