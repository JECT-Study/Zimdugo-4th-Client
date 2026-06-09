/**
 * Web 앱 전용 axios 설정
 * - @repo/libs/axios를 사용하여 API 클라이언트 생성
 * - 환경변수에서 baseURL을 주입받아 설정
 */

import { createApiClient, createApiMethods } from "@repo/libs/axios";

// API 기본 URL (환경변수 또는 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// API 클라이언트 생성
export const apiClient = createApiClient(API_BASE_URL);

// HTTP 메서드들 export
export const { httpGet, httpPost, httpPut, httpPatch, httpDelete } =
  createApiMethods(apiClient);
