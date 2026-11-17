import { create } from "zustand";

/**
 * 검색 입력 오버레이가 열려 있는지.
 *
 * 화면 사이를 오가는 값이 아니라 지금 화면 위에 잠깐 뜬 입력창의 상태라 주소에
 * 두지 않는다. 확정된 검색어는 주소(`q`)가 원본이고 여기에 두지 않는다.
 */
interface SearchState {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
}));
