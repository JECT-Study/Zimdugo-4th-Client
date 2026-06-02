// @ts-ignore Paraglide output is generated before Storybook dev/build.
export * as m from "./paraglide/messages.js";
// @ts-ignore Paraglide output is generated before Storybook dev/build.
import {
  baseLocale,
  deLocalizeHref,
  deLocalizeUrl,
  getLocale,
  getTextDirection,
  isLocale,
  locales,
  localizeHref,
  localizeUrl,
  setLocale,
} from "./paraglide/runtime.js";
// @ts-ignore Paraglide output is generated before Storybook dev/build.
import { paraglideMiddleware } from "./paraglide/server.js";

export {
  baseLocale,
  deLocalizeHref,
  deLocalizeUrl,
  getLocale,
  getTextDirection,
  isLocale,
  locales,
  localizeHref,
  localizeUrl,
  paraglideMiddleware,
  setLocale,
};
export const languageTag = getLocale;
export const setLanguageTag = setLocale;
