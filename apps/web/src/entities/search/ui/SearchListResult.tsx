import type { ReactNode } from "react";

export interface SearchListResultProps {
  children: ReactNode;
  distanceLabel: string;
  updatedLabel: string;
  isFavorite?: boolean;
  onFavoriteChange?: (next: boolean) => void;
  onPress?: () => void;
  className?: string;
}

export function SearchListResult(_props: SearchListResultProps) {
  // RowButton 기반 검색 결과 UI는 현재 이슈 커밋 범위에서 제외합니다.
  return null;
}
