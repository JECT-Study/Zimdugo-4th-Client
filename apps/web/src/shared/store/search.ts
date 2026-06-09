import { create } from "zustand";

interface Location {
  lat: number;
  lng: number;
  title: string;
}

interface SearchState {
  isSearchOpen: boolean;
  searchQuery: string;
  selectedLocation: Location | null;
  locations: Location[];
  lockerLocations: Location[];
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: Location | null) => void;
  setLocations: (locations: Location[]) => void;
  setLockerLocations: (locations: Location[]) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  searchQuery: "",
  selectedLocation: null,
  locations: [],
  lockerLocations: [],
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setLocations: (locations) => set({ locations }),
  setLockerLocations: (locations) => set({ lockerLocations: locations }),
  reset: () =>
    set({
      isSearchOpen: false,
      searchQuery: "",
      selectedLocation: null,
      locations: [],
      lockerLocations: [],
    }),
}));
