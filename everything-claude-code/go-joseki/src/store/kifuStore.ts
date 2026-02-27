import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoardState, Variation as VariationType } from '../types/go';

export interface KifuRecord {
  id: string;
  name: string;
  boardState: BoardState;
  createdAt: string;
  updatedAt: string;
  moveCount: number;
  size: 9 | 13 | 19;
  description?: string;
  blackPlayer?: string; // Name of black player
  whitePlayer?: string; // Name of white player
  winner?: string; // Winner information from SGF RE property (e.g., "黑胜白", "B+R")
}

export interface Variation extends VariationType {}

interface KifuStore {
  kifuList: Record<string, KifuRecord>;
  variations: Record<string, Variation>;
  currentKifuId: string | null; // Track the currently loaded kifu ID
  currentVariationId: string | null; // Track the currently loaded variation ID

  // Kifu Actions
  addKifu: (kifu: Omit<KifuRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeKifu: (id: string) => void;
  updateKifu: (id: string, updates: Partial<KifuRecord>) => void;
  getKifu: (id: string) => KifuRecord | undefined;
  getAllKifu: () => KifuRecord[];
  setCurrentKifuId: (id: string | null) => void; // Set current kifu ID

  // Variation Actions
  addVariation: (variation: Omit<Variation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeVariation: (id: string) => void;
  updateVariation: (id: string, updates: Partial<Variation>) => void;
  getVariation: (id: string) => Variation | undefined;
  getVariationsByParent: (parentId: string) => Variation[];
  getAllVariations: () => Variation[];
  setCurrentVariationId: (id: string | null) => void; // Set current variation ID
}

const generateId = (): string => {
  return `kifu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

const generateVariationId = (): string => {
  return `var_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const useKifuStore = create<KifuStore>()(
  persist(
    (set, get) => ({
      kifuList: {},
      variations: {},
      currentKifuId: null,
      currentVariationId: null,

      addKifu: (kifu) => {
        const now = new Date().toISOString();

        // Check if a kifu with the same name already exists
        const existingKifuId = Object.entries(get().kifuList).find(
          ([, record]) => record.name === kifu.name
        )?.[0];

        if (existingKifuId) {
          // Overwrite existing kifu with the same name
          set((state) => ({
            kifuList: {
              ...state.kifuList,
              [existingKifuId]: {
                ...kifu,
                id: existingKifuId,
                createdAt: state.kifuList[existingKifuId].createdAt,
                updatedAt: now,
              },
            },
            currentKifuId: existingKifuId,
          }));
          return existingKifuId;
        }

        // Create new kifu
        const id = generateId();
        set((state) => ({
          kifuList: {
            ...state.kifuList,
            [id]: {
              ...kifu,
              id,
              createdAt: now,
              updatedAt: now,
            },
          },
          currentKifuId: id,
        }));
        return id;
      },

      removeKifu: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.kifuList;
          // Clear currentKifuId if the removed kifu is the current one
          return {
            kifuList: rest,
            currentKifuId: state.currentKifuId === id ? null : state.currentKifuId,
          };
        });
      },

      updateKifu: (id, updates) => {
        set((state) => ({
          kifuList: {
            ...state.kifuList,
            [id]: {
              ...state.kifuList[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getKifu: (id) => {
        return get().kifuList[id];
      },

      getAllKifu: () => {
        const kifuList = get().kifuList;
        return Object.values(kifuList).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      setCurrentKifuId: (id) => {
        set({ currentKifuId: id });
      },

      addVariation: (variation) => {
        const id = generateVariationId();
        const now = new Date().toISOString();
        set((state) => ({
          variations: {
            ...state.variations,
            [id]: {
              ...variation,
              id,
              createdAt: now,
              updatedAt: now,
            },
          },
        }));
        return id;
      },

      removeVariation: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.variations;
          // Clear currentVariationId if the removed variation is the current one
          return {
            variations: rest,
            currentVariationId: state.currentVariationId === id ? null : state.currentVariationId,
          };
        });
      },

      updateVariation: (id, updates) => {
        set((state) => ({
          variations: {
            ...state.variations,
            [id]: {
              ...state.variations[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getVariation: (id) => {
        return get().variations[id];
      },

      getVariationsByParent: (parentId) => {
        const variations = get().variations;
        return Object.values(variations)
          .filter((v) => v.parentId === parentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getAllVariations: () => {
        const variations = get().variations;
        return Object.values(variations).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      setCurrentVariationId: (id) => {
        set({ currentVariationId: id });
      },
    }),
    {
      name: 'go-joseki-kifu',
      partialize: (state) => ({
        kifuList: state.kifuList,
        variations: state.variations,
        // Note: currentKifuId is NOT persisted to avoid auto-loading on refresh
      }),
    }
  )
);
