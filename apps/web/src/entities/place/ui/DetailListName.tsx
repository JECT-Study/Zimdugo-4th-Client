export interface DetailListNameProps {
  titleText: string;
  englishCaption?: string;
  distanceLabel: string;
  categoryLabel: string;
  detailLabel: string;
  onPress?: () => void;
  className?: string;
}

export function DetailListName(_props: DetailListNameProps) {
  // RowButton 기반 장소 상세 이름 UI는 현재 이슈 커밋 범위에서 제외합니다.
  return null;
}

export type SearchListNameProps = DetailListNameProps;
