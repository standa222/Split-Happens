import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppLocale } from "../locales";
import { DEFAULT_LOCALE } from "../locales";

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        // Prevent redundant updates (setting same value) which can cause render loops
        // when combined with persist rehydration + providers.
        if (get().locale === locale) return;
        set({ locale });
      },
      toggleLocale: () => {
        const current = get().locale;
        const next: AppLocale = current === "en" ? "cs" : "en";
        if (current === next) return;
        set({ locale: next });
      },
    }),
    { name: "locale-storage" }
  )
);
