export type LegalReturnSearch = {
  returnTo?: string;
  step?: number;
};

const isSafeReturnPath = (path: string): boolean =>
  path.startsWith("/") && !path.startsWith("//") && !path.includes("://");

export const parseLegalReturnSearch = (
  search: Record<string, unknown>,
): LegalReturnSearch => {
  const returnTo =
    typeof search.returnTo === "string" && isSafeReturnPath(search.returnTo)
      ? search.returnTo
      : undefined;
  const step = search.step === "2" || search.step === 2 ? 2 : undefined;

  return returnTo ? { returnTo, step } : {};
};

export const buildLegalReturnSearch = (
  returnTo: string,
  step?: number,
): LegalReturnSearch => ({
  returnTo,
  ...(step === 2 ? { step: 2 } : {}),
});
