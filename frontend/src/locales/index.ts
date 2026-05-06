import en from "./en.json";
import cs from "./cs.json";

export type AppLocale = "en" | "cs";

export const DEFAULT_LOCALE: AppLocale = "en";

export const messages: Record<AppLocale, Record<string, string>> = {
  en,
  cs,
};
