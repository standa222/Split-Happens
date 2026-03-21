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
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => {
        const current = get().locale;
        set({ locale: current === "en" ? "cs" : "en" });
      },
    }),
    { name: "locale-storage" }
  )
);

