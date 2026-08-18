interface RecoverInterruptedLocationRequestOptions {
  isInterrupted: boolean;
  reload: () => void;
}

interface RetryLocationRequestOptions
  extends RecoverInterruptedLocationRequestOptions {
  startTracking: () => void;
}

interface RetryNavigationOriginLocationOptions
  extends RetryLocationRequestOptions {
  isCurrentLocationRequested: boolean;
}

export const recoverInterruptedLocationRequest = ({
  isInterrupted,
  reload,
}: RecoverInterruptedLocationRequestOptions): boolean => {
  if (!isInterrupted) return false;

  reload();
  return true;
};

export const retryLocationRequest = ({
  isInterrupted,
  reload,
  startTracking,
}: RetryLocationRequestOptions) => {
  if (recoverInterruptedLocationRequest({ isInterrupted, reload })) return;

  startTracking();
};

export const retryNavigationOriginLocation = ({
  isCurrentLocationRequested,
  ...retryOptions
}: RetryNavigationOriginLocationOptions) => {
  if (!isCurrentLocationRequested) return;

  retryLocationRequest(retryOptions);
};
