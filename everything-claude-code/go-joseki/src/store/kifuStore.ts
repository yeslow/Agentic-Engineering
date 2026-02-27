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
}

export interface Variation extends VariationType {}

interface KifuStore {
  kifuList: Record<string, KifuRecord>;
  variations: Record<string, Variation>;

  // Kifu Actions
  addKifu: (kifu: Omit<KifuRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeKifu: (id: string) => void;
  updateKifu: (id: string, updates: Partial<KifuRecord>) => void;
  getKifu: (id: string) => KifuRecord | undefined;
  getAllKifu: () => KifuRecord[];

  // Variation Actions
  addVariation: (variation: Omit<Variation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeVariation: (id: string) => void;
  updateVariation: (id: string, updates: Partial<Variation>) => void;
  getVariation: (id: string) => Variation | undefined;
  getVariationsByParent: (parentId: string) => Variation[];
  getAllVariations: () => Variation[];
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

      addKifu: (kifu) => {
        const id = generateId();
        const now = new Date().toISOString();
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
        }));
        return id;
      },

      removeKifu: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.kifuList;
          return { kifuList: rest };
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
          return { variations: rest };
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
    }),
    {
      name: 'go-joseki-kifu',
      partialize: (state) => ({
        kifuList: state.kifuList,
        variations: state.variations,
      }),
    }
  )
);
