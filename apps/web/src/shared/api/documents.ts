import { httpGet } from "#/shared/lib/apiClient";
import type { BackendResponse } from "./lockers";

export type DocumentType = "NOTICE" | "TERMS" | "PRIVACY";

export interface SectionResponse {
  subtitle: string;
  content: string;
}

export interface ClientDocumentResponse {
  id: number;
  type: DocumentType;
  title: string;
  appliedAt: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  sections: SectionResponse[];
}

export const getDocuments = async (
  type: DocumentType,
  signal?: AbortSignal,
): Promise<ClientDocumentResponse[]> => {
  const { data: response } = await httpGet<
    BackendResponse<ClientDocumentResponse[]>
  >("/api/v1/documents", { params: { type }, signal });

  if (!response?.data) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};
