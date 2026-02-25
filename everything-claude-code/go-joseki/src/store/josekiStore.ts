import { create } from 'zustand';
import { josekiDatabase, filterJoseki, type Joseki, type JosekiFilter } from '../data/joseki';

interface JosekiStore {
  // Data
  josekiList: Joseki[];
  filteredList: Joseki[];
  selectedJoseki: Joseki | null;
  currentMoveNumber: number;
  filter: JosekiFilter;

  // Actions
  setFilter: (filter: Partial<JosekiFilter>) => void;
  clearFilter: () => void;
  selectJoseki: (id: string) => void;
  clearSelection: () => void;
  goToMove: (moveNumber: number) => void;
  nextMove: () => void;
  prevMove: () => void;
  resetPosition: () => void;
}

export const useJosekiStore = create<JosekiStore>((set, get) => ({
  josekiList: josekiDatabase,
  filteredList: josekiDatabase,
  selectedJoseki: null,
  currentMoveNumber: 0,
  filter: {},

  setFilter: (newFilter: Partial<JosekiFilter>) => {
    const { josekiList } = get();
    const updatedFilter = { ...get().filter, ...newFilter };
    const filteredList = filterJoseki(josekiList, updatedFilter);
    set({ filter: updatedFilter, filteredList });
  },

  clearFilter: () => {
    const { josekiList } = get();
    set({ filter: {}, filteredList: josekiList });
  },

  selectJoseki: (id: string) => {
    const { josekiList } = get();
    const selected = josekiList.find(j => j.id === id) || null;
    set({ selectedJoseki: selected, currentMoveNumber: 0 });
  },

  clearSelection: () => {
    set({ selectedJoseki: null, currentMoveNumber: 0 });
  },

  goToMove: (moveNumber: number) => {
    const { selectedJoseki } = get();
    if (!selectedJoseki) return;
    const maxMoves = selectedJoseki.mainLine.length;
    const clampedMoveNumber = Math.max(0, Math.min(maxMoves, moveNumber));
    set({ currentMoveNumber: clampedMoveNumber });
  },

  nextMove: () => {
    const { selectedJoseki, currentMoveNumber } = get();
    if (!selectedJoseki) return;
    if (currentMoveNumber < selectedJoseki.mainLine.length) {
      set({ currentMoveNumber: currentMoveNumber + 1 });
    }
  },

  prevMove: () => {
    const { currentMoveNumber } = get();
    if (currentMoveNumber > 0) {
      set({ currentMoveNumber: currentMoveNumber - 1 });
    }
  },

  resetPosition: () => {
    set({ currentMoveNumber: 0 });
  },
}));
