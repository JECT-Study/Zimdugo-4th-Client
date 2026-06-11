import { m } from "@repo/i18n";

const CLIENT_VALIDATION_MESSAGE_KEYS = new Set([
  "required",
  "pair_required",
  "invalid_range",
  "must_be_null",
  "min",
  "max",
  "range",
]);

const serverInvalidEnumMessage = () => m.report_error_server_invalid_enum();

const SERVER_VALIDATION_MESSAGE_KEYS = {
  "validation.invalid_enum": serverInvalidEnumMessage,
  "validation.invalid_enum_value": serverInvalidEnumMessage,
  "validation.invalid_operating_hours": () =>
    m.report_error_server_invalid_operating_hours(),
  "validation.invalid_price": () => m.report_error_server_invalid_price(),
  "validation.invalid_floor": () => m.report_error_server_invalid_floor(),
  "validation.invalid_size_types": () =>
    m.report_error_server_invalid_size_types(),
  "validation.invalid_image": () => m.report_error_server_invalid_image(),
  "validation.invalid_location": () => m.report_error_server_invalid_location(),
  "validation.prohibited_word": () => m.report_error_server_prohibited_word(),
} as const;

/** FE i18n·Zod 키 매핑. 매칭되지 않으면 서버 raw 문장/키를 그대로 반환한다. */
export const getReportValidationMessage = (message: string): string => {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) {
    return message;
  }

  const serverMessage =
    SERVER_VALIDATION_MESSAGE_KEYS[
      normalizedMessage as keyof typeof SERVER_VALIDATION_MESSAGE_KEYS
    ];
  if (serverMessage) {
    return serverMessage();
  }

  if (!CLIENT_VALIDATION_MESSAGE_KEYS.has(normalizedMessage)) {
    return normalizedMessage;
  }

  switch (normalizedMessage) {
    case "required":
      return m.report_error_required();
    case "pair_required":
      return m.report_error_time_pair_required();
    case "invalid_range":
      return m.report_error_time_invalid_range();
    case "must_be_null":
      return m.report_error_floor_must_be_null();
    case "min":
      return m.report_error_price_min();
    case "max":
      return m.report_error_price_max();
    case "range":
      return m.report_error_price_range();
    default:
      return normalizedMessage;
  }
};
