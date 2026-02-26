import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';

describe('BoardStore Navigation', () => {
  beforeEach(() => {
    // Reset store before each test
    useBoardStore.getState().initBoard(19);
  });

  describe('viewing mode', () => {
    it('should track current view move index', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      expect(useBoardStore.getState().currentViewMove).toBe(0);
      expect(useBoardStore.getState().isViewingMode).toBe(false);

      // Play some moves
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // After playing, should still be at the end
      expect(useBoardStore.getState().currentViewMove).toBe(3);
      expect(useBoardStore.getState().isViewingMode).toBe(false);
    });

    it('should enter viewing mode when navigating back', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Go back one move
      store.goToPrevious();

      expect(useBoardStore.getState().isViewingMode).toBe(true);
    });

    it('should exit viewing mode when playing a new move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.goToPrevious();

      expect(useBoardStore.getState().isViewingMode).toBe(true);

      // Play new move should exit viewing mode
      store.playMove([15, 3]);

      expect(useBoardStore.getState().isViewingMode).toBe(false);
    });
  });

  describe('goToMove', () => {
    it('should jump to specified move index', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      // Play 5 moves
      store.playMove([3, 3]); // 1
      store.playMove([15, 15]); // 2
      store.playMove([3, 15]); // 3
      store.playMove([15, 3]); // 4
      store.playMove([4, 4]); // 5

      // Jump to move 3
      store.goToMove(3);

      expect(useBoardStore.getState().currentViewMove).toBe(3);
      expect(useBoardStore.getState().board.stones.black.length + useBoardStore.getState().board.stones.white.length).toBe(3);
    });

    it('should handle jumping to move 0 (empty board)', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      store.goToMove(0);

      expect(useBoardStore.getState().currentViewMove).toBe(0);
      expect(useBoardStore.getState().board.stones.black.length).toBe(0);
      expect(useBoardStore.getState().board.stones.white.length).toBe(0);
    });

    it('should handle jumping to the end', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      store.goToMove(1); // Go to middle
      store.goToLastMove(); // Go to end

      expect(useBoardStore.getState().currentViewMove).toBe(3);
    });
  });

  describe('goToPrevious', () => {
    it('should go back one move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      expect(useBoardStore.getState().currentViewMove).toBe(3);

      store.goToPrevious();

      expect(useBoardStore.getState().currentViewMove).toBe(2);
      expect(useBoardStore.getState().board.stones.black.length + useBoardStore.getState().board.stones.white.length).toBe(2);
    });

    it('should not go below 0', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);

      store.goToPrevious();
      store.goToPrevious(); // Should stay at 0

      expect(useBoardStore.getState().currentViewMove).toBe(0);
    });
  });

  describe('goToNext', () => {
    it('should go forward one move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Go back, then forward
      store.goToPrevious(); // Now at move 2
      store.goToNext(); // Should be at move 3

      expect(useBoardStore.getState().currentViewMove).toBe(3);
    });

    it('should not go beyond the last move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      store.goToNext(); // Should stay at 2

      expect(useBoardStore.getState().currentViewMove).toBe(2);
    });
  });

  describe('board state after navigation', () => {
    it('should correctly restore board state when navigating', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // B
      store.playMove([15, 15]); // W
      store.playMove([3, 15]); // B

      // At move 1 (just first black stone)
      store.goToMove(1);

      const state = useBoardStore.getState();
      expect(state.board.stones.black.length).toBe(1);
      expect(state.board.stones.white.length).toBe(0);
      expect(state.board.currentMoveNumber).toBe(1);
    });

    it('should preserve move history when navigating', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      const fullHistoryLength = useBoardStore.getState().board.moveHistory.length;

      store.goToMove(1);

      // Full history should still be available
      expect(useBoardStore.getState().board.moveHistory.length).toBe(fullHistoryLength);
    });
  });

  describe('loadBoard with navigation', () => {
    it('should initialize navigation state when loading a board', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Simulate loading a board (e.g., from SGF)
      const loadedBoard = { ...useBoardStore.getState().board };
      store.loadBoard(loadedBoard);

      // Should start at the end
      expect(useBoardStore.getState().currentViewMove).toBe(loadedBoard.moveHistory.length);
    });
  });
});
