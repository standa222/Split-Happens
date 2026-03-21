import type { Locale as DateFnsLocale } from "date-fns";
import { enUS, cs } from "date-fns/locale";

/**
 * Map an application / react-intl locale (e.g. "cs", "cs-CZ", "en", "en-US")
 * to a date-fns Locale instance.
 *
 * Add new locales here as your app grows.
 */
export function getDateFnsLocale(appLocale: string | undefined | null): DateFnsLocale {
  const normalized = (appLocale ?? "en").toLowerCase();

  // Handle common variants.
  if (normalized === "cs" || normalized.startsWith("cs-")) return cs;

  // Default fallback.
  return enUS;
}

