interface ShouldShowMapControlsOptions {
  isMapLoading: boolean;
  hasMapError: boolean;
  hasMapInstance: boolean;
}

interface ShouldShowHomeSearchBarOptions {
  hasMapError: boolean;
}

export const shouldShowHomeSearchBar = ({
  hasMapError,
}: ShouldShowHomeSearchBarOptions) => {
  return !hasMapError;
};

export const shouldShowMapControls = ({
  isMapLoading,
  hasMapError,
  hasMapInstance,
}: ShouldShowMapControlsOptions) => {
  return !isMapLoading && !hasMapError && hasMapInstance;
};
