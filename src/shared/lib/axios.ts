import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// API 기본 URL (환경변수 또는 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * axios 인스턴스 생성
 * - baseURL: API 기본 경로
 * - timeout: 요청 제한 시간 (10초)
 * - headers: 기본 Content-Type 설정
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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

// 기본 apiClient를 사용하는 HTTP 메서드들 export
export const { httpGet, httpPost, httpPut, httpPatch, httpDelete } =
  createApiMethods(apiClient);
