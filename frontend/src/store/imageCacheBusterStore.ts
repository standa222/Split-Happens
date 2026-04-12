import { create } from "zustand";

type ImageCacheBusterState = {
  /** Incrementing version used to cache-bust image endpoints. */
  version: number;
  bump: () => void;
};

// Kept in-memory only (not persisted). A full page refresh naturally resets the version.
export const useImageCacheBusterStore = create<ImageCacheBusterState>((set) => ({
  version: Date.now(),
  bump: () => set({ version: Date.now() }),
}));

