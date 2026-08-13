import type {
  UploadCategory,
  UploadCreateData,
} from "#/shared/model/upload-types";

interface UploadFileToUploadUrlParams {
  upload: UploadCreateData;
  category: UploadCategory;
  file: File;
  contentType: string;
}

interface TrustedUploadTarget {
  hostname: string;
  namespace: string;
  bucket: string;
}

interface ParsedOciUploadTarget {
  url: URL;
  namespace: string;
  bucket: string;
  objectKey: string;
}

const UPLOAD_OBJECT_PREFIXES = {
  PROFILE: "profiles/",
  LOCKER_REPORT: "reports/",
} as const satisfies Record<UploadCategory, string>;

const DEFAULT_UPLOAD_TARGET = {
  hostname: "objectstorage.ap-osaka-1.oraclecloud.com",
  namespace: "axuj36gr8lmm",
  bucket: "zimdugo-bucket",
} as const satisfies TrustedUploadTarget;

export class UntrustedUploadDestinationError extends Error {
  constructor() {
    super("Untrusted upload destination");
    this.name = "UntrustedUploadDestinationError";
  }
}

export class UploadUrlRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Upload URL request failed with status ${status}`);
    this.name = "UploadUrlRequestError";
    this.status = status;
  }
}

const getUploadConfig = (value: string | undefined, fallback: string): string =>
  value?.trim() || fallback;

const getTrustedUploadTarget = (): TrustedUploadTarget => ({
  hostname: getUploadConfig(
    import.meta.env.VITE_UPLOAD_HOST,
    DEFAULT_UPLOAD_TARGET.hostname,
  ).toLowerCase(),
  namespace: getUploadConfig(
    import.meta.env.VITE_UPLOAD_NAMESPACE,
    DEFAULT_UPLOAD_TARGET.namespace,
  ),
  bucket: getUploadConfig(
    import.meta.env.VITE_UPLOAD_BUCKET,
    DEFAULT_UPLOAD_TARGET.bucket,
  ),
});

const parseUrl = (value: string): URL => {
  try {
    return new URL(value);
  } catch {
    throw new UntrustedUploadDestinationError();
  }
};

const decodePathSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new UntrustedUploadDestinationError();
  }
};

const parseOciUploadUrl = (value: string): ParsedOciUploadTarget => {
  const url = parseUrl(value);
  const [
    parMarker,
    parToken,
    namespaceMarker,
    namespace,
    bucketMarker,
    bucket,
    objectMarker,
    ...objectKeySegments
  ] = url.pathname.split("/").filter(Boolean);

  if (
    parMarker !== "p" ||
    !parToken ||
    namespaceMarker !== "n" ||
    !namespace ||
    bucketMarker !== "b" ||
    !bucket ||
    objectMarker !== "o" ||
    objectKeySegments.length === 0
  ) {
    throw new UntrustedUploadDestinationError();
  }

  return {
    url,
    namespace: decodePathSegment(namespace),
    bucket: decodePathSegment(bucket),
    objectKey: objectKeySegments.map(decodePathSegment).join("/"),
  };
};

const parseOciFileUrl = (value: string): ParsedOciUploadTarget => {
  const url = parseUrl(value);
  const [
    namespaceMarker,
    namespace,
    bucketMarker,
    bucket,
    objectMarker,
    ...encodedObjectKeySegments
  ] = url.pathname.split("/").filter(Boolean);

  if (
    namespaceMarker !== "n" ||
    !namespace ||
    bucketMarker !== "b" ||
    !bucket ||
    objectMarker !== "o" ||
    encodedObjectKeySegments.length === 0
  ) {
    throw new UntrustedUploadDestinationError();
  }

  return {
    url,
    namespace: decodePathSegment(namespace),
    bucket: decodePathSegment(bucket),
    objectKey: decodePathSegment(encodedObjectKeySegments.join("/")),
  };
};

const isSecureTargetUrl = (url: URL, hostname: string): boolean =>
  url.protocol === "https:" &&
  url.hostname.toLowerCase() === hostname &&
  url.port === "" &&
  url.username === "" &&
  url.password === "" &&
  url.search === "" &&
  url.hash === "";

export const assertTrustedUploadDestination = ({
  upload,
  category,
}: {
  upload: UploadCreateData;
  category: UploadCategory;
}): void => {
  const trusted = getTrustedUploadTarget();
  const uploadTarget = parseOciUploadUrl(upload.uploadUrl);
  const fileTarget = parseOciFileUrl(upload.fileUrl);
  const expectedPrefix = UPLOAD_OBJECT_PREFIXES[category];

  const isTrusted =
    isSecureTargetUrl(uploadTarget.url, trusted.hostname) &&
    isSecureTargetUrl(fileTarget.url, trusted.hostname) &&
    uploadTarget.namespace === trusted.namespace &&
    fileTarget.namespace === trusted.namespace &&
    uploadTarget.bucket === trusted.bucket &&
    fileTarget.bucket === trusted.bucket &&
    uploadTarget.objectKey.startsWith(expectedPrefix) &&
    uploadTarget.objectKey.length > expectedPrefix.length &&
    uploadTarget.objectKey === fileTarget.objectKey &&
    uploadTarget.objectKey === upload.key;

  if (!isTrusted) {
    throw new UntrustedUploadDestinationError();
  }
};

export async function uploadFileToUploadUrl({
  upload,
  category,
  file,
  contentType,
}: UploadFileToUploadUrlParams): Promise<void> {
  assertTrustedUploadDestination({ upload, category });

  const response = await fetch(upload.uploadUrl, {
    method: "PUT",
    body: file,
    credentials: "omit",
    mode: "cors",
    redirect: "error",
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new UploadUrlRequestError(response.status);
  }
}
