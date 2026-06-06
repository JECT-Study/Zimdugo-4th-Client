import { create } from "zustand";

export type SheetMode = "idle" | "list" | "filter" | "addressList";

interface Location {
  lat: number;
  lng: number;
  title: string;
}

interface SearchState {
  isSearchOpen: boolean;
  sheetMode: SheetMode;
  searchQuery: string;
  selectedLocation: Location | null;
  locations: Location[];
  lockerLocations: Location[];
  setIsSearchOpen: (open: boolean) => void;
  setSheetMode: (mode: SheetMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: Location | null) => void;
  setLocations: (locations: Location[]) => void;
  setLockerLocations: (locations: Location[]) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  sheetMode: "idle",
  searchQuery: "",
  selectedLocation: null,
  locations: [],
  lockerLocations: [],
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setSheetMode: (mode) => set({ sheetMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setLocations: (locations) => set({ locations }),
  setLockerLocations: (locations) => set({ lockerLocations: locations }),
  reset: () =>
    set({
      isSearchOpen: false,
      sheetMode: "idle",
      searchQuery: "",
      selectedLocation: null,
      locations: [],
      lockerLocations: [],
    }),
}));
