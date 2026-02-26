import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';

describe('BoardStore Game Mode', () => {
  beforeEach(() => {
    useBoardStore.getState().initBoard(19);
  });

  describe('gameMode state', () => {
    it('should initialize with battle mode by default', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      expect(useBoardStore.getState().gameMode).toBe('battle');
    });

    it('should have trialStones state for temporary moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      expect(useBoardStore.getState().trialStones).toEqual({
        black: [],
        white: [],
      });
    });
  });

  describe('setGameMode', () => {
    it('should switch from battle to trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);

      store.setGameMode('trial');

      expect(useBoardStore.getState().gameMode).toBe('trial');
    });

    it('should switch from trial to battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.setGameMode('battle');

      expect(useBoardStore.getState().gameMode).toBe('battle');
    });

    it('should clear trial stones when entering trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      // Add some trial stones first
      store.setGameMode('trial');
      store.playTrialMove([3, 3]);
      store.playTrialMove([15, 15]);

      // Switch to battle and back to trial
      store.setGameMode('battle');
      store.setGameMode('trial');

      // Trial stones should be cleared when mode changes
      expect(useBoardStore.getState().trialStones).toEqual({
        black: [],
        white: [],
      });
    });
  });

  describe('enterTrialMode and exitTrialMode', () => {
    it('should enter trial mode from battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      expect(useBoardStore.getState().gameMode).toBe('battle');

      store.enterTrialMode();

      expect(useBoardStore.getState().gameMode).toBe('trial');
    });

    it('should exit trial mode and return to battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.enterTrialMode();
      expect(useBoardStore.getState().gameMode).toBe('trial');

      store.exitTrialMode();

      expect(useBoardStore.getState().gameMode).toBe('battle');
    });

    it('should clear trial stones when exiting trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.enterTrialMode();
      store.playTrialMove([3, 3]);
      store.playTrialMove([15, 15]);

      expect(useBoardStore.getState().trialStones.black.length).toBe(1);
      expect(useBoardStore.getState().trialStones.white.length).toBe(1);

      store.exitTrialMode();

      expect(useBoardStore.getState().trialStones).toEqual({
        black: [],
        white: [],
      });
    });
  });

  describe('playTrialMove', () => {
    it('should add a black stone to trialStones', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.playTrialMove([3, 3]);

      expect(useBoardStore.getState().trialStones.black).toContainEqual([3, 3]);
    });

    it('should add a white stone to trialStones alternately', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.playTrialMove([3, 3]); // Black
      store.playTrialMove([15, 15]); // White

      expect(useBoardStore.getState().trialStones.black).toContainEqual([3, 3]);
      expect(useBoardStore.getState().trialStones.white).toContainEqual([15, 15]);
    });

    it('should not modify main board stones', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([4, 4]); // Add to main board

      store.setGameMode('trial');
      store.playTrialMove([3, 3]); // Add to trial

      expect(useBoardStore.getState().board.stones.black).toContainEqual([4, 4]);
      expect(useBoardStore.getState().board.stones.black).not.toContainEqual([3, 3]);
    });

    it('should return false when trying to play on occupied spot in trial', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // Add to main board

      store.setGameMode('trial');
      const result = store.playTrialMove([3, 3]); // Try same spot

      expect(result).toBe(false);
    });
  });

  describe('undoTrialMove', () => {
    it('should remove the last trial move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.playTrialMove([3, 3]); // Black
      store.playTrialMove([15, 15]); // White

      store.undoTrialMove();

      expect(useBoardStore.getState().trialStones.black).toContainEqual([3, 3]);
      expect(useBoardStore.getState().trialStones.white).toEqual([]);
    });

    it('should handle undo when no trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.undoTrialMove(); // Should not error

      expect(useBoardStore.getState().trialStones).toEqual({
        black: [],
        white: [],
      });
    });
  });

  describe('clearTrialStones', () => {
    it('should remove all trial stones', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      store.playTrialMove([3, 3]);
      store.playTrialMove([15, 15]);
      store.playTrialMove([3, 15]);

      store.clearTrialStones();

      expect(useBoardStore.getState().trialStones).toEqual({
        black: [],
        white: [],
      });
    });
  });

  describe('playMove in trial mode', () => {
    it('should not allow playMove in trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.setGameMode('trial');

      const result = store.playMove([3, 3]);

      expect(result).toBe(false);
      // Main board should not change
      expect(useBoardStore.getState().board.stones.black).toEqual([]);
    });

    it('should allow playMove in battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      expect(useBoardStore.getState().gameMode).toBe('battle');

      const result = store.playMove([3, 3]);

      expect(result).toBe(true);
      expect(useBoardStore.getState().board.stones.black).toContainEqual([3, 3]);
    });
  });

  describe('auto enter trial mode when navigating', () => {
    it('should auto enter trial mode when navigating to middle of game', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      expect(useBoardStore.getState().gameMode).toBe('battle');

      // Navigate to middle
      store.goToMove(1);

      // Should auto enter trial mode
      expect(useBoardStore.getState().gameMode).toBe('trial');
    });

    it('should stay in battle mode when at the end of moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      expect(useBoardStore.getState().gameMode).toBe('battle');

      // Navigate to end (same position)
      store.goToMove(2);

      // Should stay in battle mode
      expect(useBoardStore.getState().gameMode).toBe('battle');
    });
  });
});

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
      expect(useBoardStore.getState().gameMode).toBe('trial');

      // In trial mode, playMove should be rejected
      // User needs to exit trial mode first
      store.exitTrialMode();
      expect(useBoardStore.getState().gameMode).toBe('battle');

      // Now playMove should work
      const result = store.playMove([15, 3]);
      expect(result).toBe(true);
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
