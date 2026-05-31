interface ShouldShowMapControlsOptions {
  isMapLoading: boolean;
  hasMapError: boolean;
  hasMapInstance: boolean;
}

export const shouldShowMapControls = ({
  isMapLoading,
  hasMapError,
  hasMapInstance,
}: ShouldShowMapControlsOptions) => {
  return !isMapLoading && !hasMapError && hasMapInstance;
};
