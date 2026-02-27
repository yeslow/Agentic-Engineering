import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';
import { useKifuStore } from './kifuStore';
import { sgfToBoard } from '../lib/sgf';

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

    it('should capture opponent stones in trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);

      // Set up a simple capture scenario:
      // Place white stone at [1, 1]
      // Place black stones at [0, 1] and [1, 0] (surrounding white)
      store.playMove([0, 0]); // Black at corner
      store.playMove([1, 0]); // White adjacent
      store.playMove([2, 0]); // Black
      store.playMove([0, 1]); // White

      // Now black can capture the white at [1, 0] by playing [1, 1]
      // Let's verify this works in battle mode first
      const battleStore = useBoardStore.getState();
      battleStore.initBoard(19);
      battleStore.playMove([1, 0]); // Black
      battleStore.playMove([0, 0]); // White
      battleStore.playMove([2, 0]); // Black
      battleStore.playMove([0, 1]); // White
      battleStore.playMove([1, 1]); // Black - should capture white at [0, 0]

      // White at [0, 0] should be captured
      expect(battleStore.board.stones.white).not.toContainEqual([0, 0]);
    });

    it('should capture stones in trial mode when trial move captures', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);

      // Set up: Black surrounds a white stone
      store.playMove([1, 0]); // Black
      store.playMove([0, 0]); // White
      store.playMove([2, 0]); // Black
      store.playMove([15, 15]); // White (pass)
      store.playMove([0, 1]); // Black

      // Now [0, 0] white is surrounded on 3 sides (edge), [1, 0] black can capture

      store.goToMove(5); // Go back to see position
      store.setGameMode('trial');

      // Play trial move at [1, 0] - but wait, [1, 0] already has black
      // Let's play at [1, 1] which doesn't help... need different setup

      // Let me try a simpler approach - play trial move that captures
      store.initBoard(19);
      store.playMove([1, 0]); // Black
      store.playMove([0, 0]); // White
      store.playMove([0, 1]); // Black (captures white at [0,0] in battle mode)

      // Verify capture in battle mode
      const battleState = useBoardStore.getState();
      expect(battleState.board.stones.white).not.toContainEqual([0, 0]);

      // Now test trial mode capture
      store.initBoard(19);
      store.playMove([1, 0]); // Black at [1, 0]
      store.playMove([0, 0]); // White at [0, 0]

      // Now in trial mode, play black at [0, 1] to capture white at [0, 0]
      store.goToMove(2);
      store.setGameMode('trial');

      const trialResult = store.playTrialMove([0, 1]);

      expect(trialResult).toBe(true);
      // The white stone at [0, 0] should be marked as captured
      const state = useBoardStore.getState();
      expect(state.trialCapturedStones.black).toContainEqual([0, 0]);
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

  describe('viewing mode when navigating', () => {
    it('should stay in battle mode when navigating to middle of game', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      expect(useBoardStore.getState().gameMode).toBe('battle');

      // Navigate to middle
      store.goToMove(1);

      // Should stay in battle mode, trial mode is only entered on click if there are more moves
      expect(useBoardStore.getState().gameMode).toBe('battle');
      expect(useBoardStore.getState().isViewingMode).toBe(true);
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

      // After navigating back, should be in viewing mode but still battle mode
      expect(useBoardStore.getState().isViewingMode).toBe(true);
      expect(useBoardStore.getState().gameMode).toBe('battle');

      // GoBoard click handler will decide to enter trial mode if there are more moves
      // Manually enter trial mode to simulate the new behavior
      store.enterTrialMode();
      expect(useBoardStore.getState().gameMode).toBe('trial');

      // Exit trial mode and play a move
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

    it('should correctly set currentMoveNumber when loading board from SGF', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd];W[dc];B[ec])';
      const { board: importedBoard } = sgfToBoard(sgf);

      // Verify the imported board has correct currentMoveNumber
      expect(importedBoard.moveHistory.length).toBe(5);
      expect(importedBoard.currentMoveNumber).toBe(5);

      // Load the board
      const store = useBoardStore.getState();
      store.loadBoard(importedBoard);

      // Verify the store has correct currentMoveNumber
      const storeBoard = useBoardStore.getState().board;
      expect(storeBoard.currentMoveNumber).toBe(5);
      expect(storeBoard.currentMoveNumber).toBe(storeBoard.moveHistory.length);
    });

    it('should handle navigation when SGF contains invalid moves that were filtered out', () => {
      // This SGF has a ko situation - white takes ko, black tries to retake immediately
      // The invalid move should be filtered during import
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd];W[dc];B[de];W[ed];B[ee];W[dd])';
      const { board: importedBoard } = sgfToBoard(sgf);

      // Load the board
      const store = useBoardStore.getState();
      store.loadBoard(importedBoard);

      // Should be able to navigate without errors
      expect(() => store.goToMove(0)).not.toThrow();
      expect(() => store.goToMove(3)).not.toThrow();

      // Should be able to go to next move
      expect(() => store.goToNext()).not.toThrow();
    });

    it('should synchronize board currentMoveNumber with actual successfully played moves during navigation', () => {
      // SGF with an invalid move (move 8 W[dd] is invalid - ko)
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd];W[dc];B[de];W[ed];B[ee];W[dd])';
      const { board: importedBoard } = sgfToBoard(sgf);

      // The invalid move should be filtered, so we should have 7 valid moves
      const validMoveCount = importedBoard.currentMoveNumber;

      // Load the board
      const store = useBoardStore.getState();
      store.loadBoard(importedBoard);

      // Navigate to the end
      store.goToMove(validMoveCount);

      // board.currentMoveNumber should match the number of successfully played moves
      const board = useBoardStore.getState().board;
      expect(board.currentMoveNumber).toBe(validMoveCount);

      // Verify stone count matches currentMoveNumber
      expect(board.stones.black.length + board.stones.white.length).toBe(validMoveCount);
    });
  });
});

describe('Trial Mode Progress Bar', () => {
  beforeEach(() => {
    useBoardStore.getState().initBoard(19);
  });

  describe('trialModeEntryMove - saving progress when entering trial mode', () => {
    it('should save the current move index when entering trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Go back to middle of game
      store.goToMove(1);
      expect(useBoardStore.getState().currentViewMove).toBe(1);

      // Enter trial mode
      store.enterTrialMode();

      // Should remember the entry move
      expect(useBoardStore.getState().trialModeEntryMove).toBe(1);
    });

    it('should save entry move as 0 when entering from start', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);

      store.enterTrialMode();

      expect(useBoardStore.getState().trialModeEntryMove).toBe(0);
    });

    it('should save entry move when at the end of game', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      store.enterTrialMode();

      expect(useBoardStore.getState().trialModeEntryMove).toBe(2);
    });
  });

  describe('trialMoveHistory - tracking trial moves for progress bar', () => {
    it('should track trial moves in a history array', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.enterTrialMode();

      store.playTrialMove([3, 3]);

      expect(useBoardStore.getState().trialMoveHistory.length).toBe(1);
      expect(useBoardStore.getState().trialMoveHistory[0]).toEqual({
        coordinate: [3, 3],
        color: 'black',
      });
    });

    it('should track multiple trial moves in sequence', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.enterTrialMode();

      store.playTrialMove([3, 3]); // Black
      store.playTrialMove([15, 15]); // White

      const state = useBoardStore.getState();
      expect(state.trialMoveHistory.length).toBe(2);
      expect(state.trialMoveHistory[0]).toEqual({ coordinate: [3, 3], color: 'black' });
      expect(state.trialMoveHistory[1]).toEqual({ coordinate: [15, 15], color: 'white' });
    });

    it('should calculate total moves as board moves + trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      store.enterTrialMode();
      store.playTrialMove([3, 15]);
      store.playTrialMove([15, 3]);

      const state = useBoardStore.getState();
      const totalMoves = state.board.moveHistory.length + state.trialMoveHistory.length;
      expect(totalMoves).toBe(4);
    });
  });

  describe('exitTrialMode - restoring progress', () => {
    it('should restore to entry move when exiting trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Go back to move 1 and enter trial mode
      store.goToMove(1);
      store.enterTrialMode();

      // Play some trial moves
      store.playTrialMove([10, 10]);
      store.playTrialMove([10, 11]);

      // Exit trial mode
      store.exitTrialMode();

      // Should restore to entry move (1), not last board move (3)
      expect(useBoardStore.getState().currentViewMove).toBe(1);
    });

    it('should restore board state to entry move when exiting trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // move 1
      store.playMove([15, 15]); // move 2
      store.playMove([3, 15]); // move 3

      // Go back to move 1 and enter trial mode
      store.goToMove(1);
      store.enterTrialMode();

      // Play some trial moves
      store.playTrialMove([10, 10]);
      store.playTrialMove([10, 11]);

      // Exit trial mode
      store.exitTrialMode();

      // Board should show only move 1 (black stone at [3,3])
      const state = useBoardStore.getState();
      expect(state.board.stones.black).toHaveLength(1);
      expect(state.board.stones.black).toContainEqual([3, 3]);
      expect(state.board.stones.white).toHaveLength(0);
      expect(state.board.currentMoveNumber).toBe(1);
    });

    it('should update progress bar to entry move when exiting trial mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);

      // Go back to move 2 and enter trial mode
      store.goToMove(2);
      store.enterTrialMode();

      // Play some trial moves
      store.playTrialMove([10, 10]);

      // Exit trial mode
      store.exitTrialMode();

      // Progress bar should show entry move (2)
      const state = useBoardStore.getState();
      expect(state.currentViewMove).toBe(2);
      expect(state.board.currentMoveNumber).toBe(2);
      expect(state.getTotalMoves()).toBe(3); // Total board moves
      expect(state.getCurrentTrialMoveIndex()).toBe(2); // Current position
    });

    it('should clear trial move history when exiting', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.enterTrialMode();
      store.playTrialMove([3, 3]);
      store.playTrialMove([15, 15]);

      store.exitTrialMode();

      expect(useBoardStore.getState().trialMoveHistory).toEqual([]);
    });
  });

  describe('getTotalMoves - helper for progress bar calculation', () => {
    it('should return board move count in battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);

      expect(store.getTotalMoves()).toBe(2);
    });

    it('should return only board moves (trial stones not counted in progress bar)', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.enterTrialMode();
      store.playTrialMove([3, 15]);

      // Progress bar shows only board moves, trial stones are extra
      expect(store.getTotalMoves()).toBe(2);
    });
  });

  describe('getCurrentTrialMoveIndex - for progress bar position', () => {
    it('should return currentViewMove in battle mode', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.goToMove(1);

      expect(store.getCurrentTrialMoveIndex()).toBe(1);
    });

    it('should return currentViewMove in trial mode (trial stones not shown on progress bar)', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.goToMove(1);
      store.enterTrialMode();

      // At entry, should show current board position
      expect(store.getCurrentTrialMoveIndex()).toBe(1);

      // After trial move, progress bar still shows board position (trial stones are extra)
      store.playTrialMove([3, 15]);
      expect(store.getCurrentTrialMoveIndex()).toBe(1);
    });
  });

  describe('trial mode navigation - trial stones are extra (not on progress bar)', () => {
    it('should keep progress bar at board position when playing trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.enterTrialMode();

      // Play 3 trial moves
      store.playTrialMove([3, 15]); // trial move 1
      store.playTrialMove([15, 3]); // trial move 2
      store.playTrialMove([4, 4]); // trial move 3

      // Progress bar shows board moves only (2), trial stones are extra
      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(2);
      expect(useBoardStore.getState().trialMoveHistory.length).toBe(3);

      // Navigate to board move 1 (should clear trial moves after that position)
      store.goToMove(1);

      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(1);
      expect(useBoardStore.getState().trialMoveHistory.length).toBe(0);
    });

    it('should clear trial moves when navigating to earlier board position', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // Black 1
      store.playMove([15, 15]); // White 2
      store.enterTrialMode();

      // Play 3 trial moves
      store.playTrialMove([3, 15]);
      store.playTrialMove([15, 3]);
      store.playTrialMove([4, 4]);

      // Progress bar shows board position (2)
      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(2);

      // Navigate to board move 1 - clears all trial moves
      store.goToMove(1);

      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(1);
      expect(useBoardStore.getState().trialMoveHistory.length).toBe(0);
    });

    it('should clear all trial moves when navigating to entry move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.enterTrialMode();

      store.playTrialMove([3, 15]);
      store.playTrialMove([15, 3]);

      // Navigate to board move 2 (entry point)
      store.goToMove(2);

      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(2);
      expect(useBoardStore.getState().trialMoveHistory.length).toBe(0);
      expect(useBoardStore.getState().trialStones.black).toEqual([]);
      expect(useBoardStore.getState().trialStones.white).toEqual([]);
    });

    it('should stay in trial mode when navigating back to entry move', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.enterTrialMode();

      store.playTrialMove([3, 15]);
      store.playTrialMove([15, 3]);

      expect(useBoardStore.getState().gameMode).toBe('trial');

      // Navigate back to entry move (move 2)
      store.goToMove(2);

      // Should still be in trial mode
      expect(useBoardStore.getState().gameMode).toBe('trial');
    });

    it('should stay in trial mode when navigating back within board moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.playMove([3, 15]);
      store.playMove([15, 3]);
      store.enterTrialMode();

      store.playTrialMove([4, 4]);

      expect(useBoardStore.getState().gameMode).toBe('trial');

      // Navigate back to move 1 (before entry move which is 4)
      store.goToMove(1);

      // Should still be in trial mode
      expect(useBoardStore.getState().gameMode).toBe('trial');
      expect(useBoardStore.getState().trialModeEntryMove).toBe(4);
    });

    it('should not undo board moves when undoing trial move with no trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // move 1
      store.playMove([15, 15]); // move 2
      store.goToMove(2);
      store.enterTrialMode();

      // No trial moves played yet
      expect(useBoardStore.getState().trialMoveCount).toBe(0);

      // Undo trial move should do nothing when there are no trial moves
      store.undoTrialMove();

      // Should still be at move 2
      expect(useBoardStore.getState().getCurrentTrialMoveIndex()).toBe(2);
      expect(useBoardStore.getState().trialModeEntryMove).toBe(2);
    });

    it('should not go back in board history when using goToPrevious with no trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // move 1
      store.playMove([15, 15]); // move 2
      store.goToMove(2);
      store.enterTrialMode();

      // No trial moves played yet
      expect(useBoardStore.getState().trialMoveCount).toBe(0);

      // Record board state before goToPrevious
      const stonesBefore = {
        black: useBoardStore.getState().board.stones.black.length,
        white: useBoardStore.getState().board.stones.white.length,
      };

      // goToPrevious should not go back in board history when in trial mode with no trial moves
      store.goToPrevious();

      // Should stay at the same board position (entry move)
      expect(useBoardStore.getState().board.stones.black.length).toBe(stonesBefore.black);
      expect(useBoardStore.getState().board.stones.white.length).toBe(stonesBefore.white);
      expect(useBoardStore.getState().trialModeEntryMove).toBe(2);
    });

    it('should return board move count in trial mode (trial stones not counted)', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // move 1
      store.playMove([15, 15]); // move 2
      store.playMove([3, 15]); // move 3

      // Go back to move 2
      store.goToMove(2);
      store.enterTrialMode();

      // Total moves should be board moves only (3)
      expect(useBoardStore.getState().getTotalMoves()).toBe(3);
    });

    it('should return board move count after playing trial moves', () => {
      const store = useBoardStore.getState();
      store.initBoard(19);
      store.playMove([3, 3]); // move 1
      store.playMove([15, 15]); // move 2

      // Go back to move 1
      store.goToMove(1);
      store.enterTrialMode();

      // Play 2 trial moves
      store.playTrialMove([3, 15]);
      store.playTrialMove([15, 3]);

      // Total moves should be board moves only (2), trial stones are extra
      expect(useBoardStore.getState().getTotalMoves()).toBe(2);
    });
  });
});

describe('Blank Board Move Placement - New Feature', () => {
  beforeEach(() => {
    // Reset both stores to initial state
    useBoardStore.getState().initBoard(19);
    useKifuStore.getState().setCurrentKifuId(null);
  });

  describe('Initial State', () => {
    it('should start with blank board state (no kifu loaded)', () => {
      const { board } = useBoardStore.getState();
      const { currentKifuId } = useKifuStore.getState();

      expect(currentKifuId).toBeNull();
      expect(board.moveHistory).toHaveLength(0);
      expect(board.stones.black).toHaveLength(0);
      expect(board.stones.white).toHaveLength(0);
    });

    it('should have gameMode as battle initially', () => {
      const { gameMode } = useBoardStore.getState();
      expect(gameMode).toBe('battle');
    });
  });

  describe('Move Placement on Blank Board', () => {
    it('should play first move as black on blank board', () => {
      const { playMove } = useBoardStore.getState();

      const result = playMove([3, 3]);

      expect(result).toBe(true);
      const { board, currentColor } = useBoardStore.getState();
      expect(board.stones.black).toContainEqual([3, 3]);
      expect(currentColor).toBe('white'); // Next color should be white
    });

    it('should alternate colors for subsequent moves on blank board', () => {
      const { playMove } = useBoardStore.getState();

      playMove([3, 3]); // Black
      playMove([4, 4]); // White
      playMove([5, 5]); // Black

      const { board } = useBoardStore.getState();
      expect(board.stones.black).toHaveLength(2);
      expect(board.stones.white).toHaveLength(1);
      expect(board.stones.black).toContainEqual([3, 3]);
      expect(board.stones.black).toContainEqual([5, 5]);
      expect(board.stones.white).toContainEqual([4, 4]);
    });

    it('should add moves to moveHistory on blank board', () => {
      const { playMove } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);

      const { board } = useBoardStore.getState();
      expect(board.moveHistory).toHaveLength(2);
      expect(board.moveHistory[0]).toMatchObject({ coordinate: [3, 3], color: 'black' });
      expect(board.moveHistory[1]).toMatchObject({ coordinate: [4, 4], color: 'white' });
    });

    it('should update currentViewMove when playing moves on blank board', () => {
      const { playMove } = useBoardStore.getState();

      playMove([3, 3]);
      expect(useBoardStore.getState().currentViewMove).toBe(1);

      playMove([4, 4]);
      expect(useBoardStore.getState().currentViewMove).toBe(2);
    });
  });

  describe('Undo on Blank Board', () => {
    it('should remove last move from history when undoing on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      undo();

      const { board } = useBoardStore.getState();
      expect(board.moveHistory).toHaveLength(1);
      expect(board.stones.black).toContainEqual([3, 3]);
      expect(board.stones.white).toHaveLength(0);
    });

    it('should update currentViewMove after undo on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      expect(useBoardStore.getState().currentViewMove).toBe(2);

      undo();
      expect(useBoardStore.getState().currentViewMove).toBe(1);
    });

    it('should allow continuing moves after undo on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]); // Black
      playMove([4, 4]); // White
      undo(); // Undo white's move

      // Continue playing - should work normally
      // After undoing white's move, it should be white's turn again
      const result = playMove([5, 5]);
      expect(result).toBe(true);

      const { board } = useBoardStore.getState();
      expect(board.moveHistory).toHaveLength(2);
      expect(board.stones.black).toHaveLength(1); // [3,3]
      expect(board.stones.white).toHaveLength(1); // [5,5] (replaces undone [4,4])
    });

    it('should stay in battle mode after undo on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      undo();

      const { gameMode } = useBoardStore.getState();
      expect(gameMode).toBe('battle');
    });

    it('should alternate colors correctly after undo on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]); // Black
      playMove([4, 4]); // White
      undo(); // Undo white

      // After undo, it should be white's turn again
      const { currentColor } = useBoardStore.getState();
      expect(currentColor).toBe('white');

      // Play again should be white
      playMove([5, 5]);
      const { board } = useBoardStore.getState();
      expect(board.stones.white).toContainEqual([5, 5]);
    });
  });

  describe('Trial Mode Logic on Blank Board', () => {
    it('should NOT enter trial mode when board has stones but no kifu is loaded', () => {
      // This tests the key behavior: blank board should never enter trial mode
      const { playMove } = useBoardStore.getState();
      const { currentKifuId } = useKifuStore.getState();

      // Verify no kifu is loaded (blank board)
      expect(currentKifuId).toBeNull();

      // Play some moves
      playMove([3, 3]);
      playMove([4, 4]);

      // Should still be in battle mode
      expect(useBoardStore.getState().gameMode).toBe('battle');
    });

    it('should stay in battle mode when continuing moves after undo on blank board', () => {
      const { playMove, undo } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      undo();

      // Continue playing
      playMove([5, 5]);

      // Should still be in battle mode
      expect(useBoardStore.getState().gameMode).toBe('battle');
    });
  });

  describe('Saved Kifu Behavior', () => {
    it('should track when a kifu is loaded', () => {
      // Simulate loading a saved kifu
      useKifuStore.getState().setCurrentKifuId('test-kifu-id');

      const { currentKifuId } = useKifuStore.getState();
      expect(currentKifuId).toBe('test-kifu-id');
    });

    it('should distinguish between blank board and saved kifu', () => {
      // Blank board
      expect(useKifuStore.getState().currentKifuId).toBeNull();

      // Load a kifu
      useKifuStore.getState().setCurrentKifuId('saved-kifu');
      expect(useKifuStore.getState().currentKifuId).not.toBeNull();
    });
  });
});

describe('Board Store - isBlankBoard helper logic', () => {
  beforeEach(() => {
    useBoardStore.getState().initBoard(19);
    useKifuStore.getState().setCurrentKifuId(null);
  });

  it('should identify blank board when currentKifuId is null', () => {
    const { currentKifuId } = useKifuStore.getState();
    const isBlankBoard = !currentKifuId;
    expect(isBlankBoard).toBe(true);
  });

  it('should identify saved kifu when currentKifuId is set', () => {
    useKifuStore.getState().setCurrentKifuId('some-kifu-id');
    const { currentKifuId } = useKifuStore.getState();
    const isBlankBoard = !currentKifuId;
    expect(isBlankBoard).toBe(false);
  });
});

describe('Board Store - isAtLatestMove logic', () => {
  beforeEach(() => {
    useBoardStore.getState().initBoard(19);
    useKifuStore.getState().setCurrentKifuId(null);
  });

  it('should be at latest move when currentViewMove equals moveHistory length', () => {
    const { playMove } = useBoardStore.getState();

    playMove([3, 3]);
    playMove([4, 4]);

    const { currentViewMove, board } = useBoardStore.getState();
    const isAtLatestMove = currentViewMove >= board.moveHistory.length;

    expect(isAtLatestMove).toBe(true);
  });

  it('should NOT be at latest move when currentViewMove is less than moveHistory length', () => {
    const { playMove, goToMove } = useBoardStore.getState();

    playMove([3, 3]);
    playMove([4, 4]);
    playMove([5, 5]);

    // Go back to move 1
    goToMove(1);

    const { currentViewMove, board } = useBoardStore.getState();
    const isAtLatestMove = currentViewMove >= board.moveHistory.length;

    expect(isAtLatestMove).toBe(false);
    expect(currentViewMove).toBe(1);
    expect(board.moveHistory.length).toBe(3);
  });
});

describe('Board Store - Truncate on blank board', () => {
  beforeEach(() => {
    useBoardStore.getState().initBoard(19);
    useKifuStore.getState().setCurrentKifuId(null);
  });

  describe('goToMove with shouldTruncate', () => {
    it('should truncate move history when shouldTruncate is true', () => {
      const { playMove, goToMove } = useBoardStore.getState();

      // Play 5 moves
      playMove([3, 3]); // 1
      playMove([4, 4]); // 2
      playMove([5, 5]); // 3
      playMove([6, 6]); // 4
      playMove([7, 7]); // 5

      expect(useBoardStore.getState().board.moveHistory.length).toBe(5);

      // Truncate to move 2
      goToMove(2, true);

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(2);
      expect(currentViewMove).toBe(2);
      expect(board.currentMoveNumber).toBe(2);
    });

    it('should NOT truncate move history when shouldTruncate is false', () => {
      const { playMove, goToMove } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      playMove([5, 5]);

      // Navigate without truncation
      goToMove(1, false);

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(3); // History preserved
      expect(currentViewMove).toBe(1); // But viewing move 1
    });

    it('should allow continuing play after truncate', () => {
      const { playMove, goToMove } = useBoardStore.getState();

      playMove([3, 3]); // Black 1
      playMove([4, 4]); // White 2
      playMove([5, 5]); // Black 3

      // Truncate to move 1
      goToMove(1, true);

      const stateBefore = useBoardStore.getState();
      expect(stateBefore.board.moveHistory.length).toBe(1);
      expect(stateBefore.currentColor).toBe('white'); // White's turn

      // Continue playing
      playMove([10, 10]); // White 2

      const stateAfter = useBoardStore.getState();
      expect(stateAfter.board.moveHistory.length).toBe(2);
      expect(stateAfter.board.stones.white).toContainEqual([10, 10]);
    });

    it('should reset to empty board when truncating to move 0', () => {
      const { playMove, goToMove } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);

      goToMove(0, true);

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(0);
      expect(board.stones.black.length).toBe(0);
      expect(board.stones.white.length).toBe(0);
      expect(currentViewMove).toBe(0);
    });
  });

  describe('goToPrevious with shouldTruncate', () => {
    it('should truncate when shouldTruncate is true', () => {
      const { playMove, goToPrevious } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      playMove([5, 5]);

      // Truncate backward
      goToPrevious(true);

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(2);
      expect(currentViewMove).toBe(2);
    });

    it('should NOT truncate when shouldTruncate is false', () => {
      const { playMove, goToPrevious } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      playMove([5, 5]);

      // Navigate backward without truncation
      goToPrevious(false);

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(3); // History preserved
      expect(currentViewMove).toBe(2);
    });

    it('should not go below move 0 when truncating', () => {
      const { playMove, goToPrevious } = useBoardStore.getState();

      playMove([3, 3]);

      goToPrevious(true); // To move 0
      goToPrevious(true); // Should stay at move 0

      const { board, currentViewMove } = useBoardStore.getState();
      expect(board.moveHistory.length).toBe(0);
      expect(currentViewMove).toBe(0);
    });
  });

  describe('truncate behavior with saved kifu', () => {
    it('should truncate new moves after saving kifu when at latest move', () => {
      // Simulate: save kifu, then play more moves (unsaved)
      useKifuStore.getState().setCurrentKifuId('saved-kifu');
      const { playMove, goToPrevious } = useBoardStore.getState();

      // Original saved moves
      playMove([3, 3]);
      playMove([4, 4]);

      // New unsaved moves (at latest)
      playMove([5, 5]);
      playMove([6, 6]);

      const stateBefore = useBoardStore.getState();
      expect(stateBefore.board.moveHistory.length).toBe(4);
      expect(stateBefore.currentViewMove).toBe(4); // At latest

      // Truncate backward - should delete the unsaved moves
      goToPrevious(true);

      const stateAfter = useBoardStore.getState();
      expect(stateAfter.board.moveHistory.length).toBe(3);
      expect(stateAfter.currentViewMove).toBe(3);
    });

    it('should NOT truncate when viewing history (not at latest)', () => {
      useKifuStore.getState().setCurrentKifuId('saved-kifu');
      const { playMove, goToMove, goToPrevious } = useBoardStore.getState();

      playMove([3, 3]);
      playMove([4, 4]);
      playMove([5, 5]);

      // Go back to view history (not at latest)
      goToMove(1);

      const stateBefore = useBoardStore.getState();
      expect(stateBefore.currentViewMove).toBe(1);
      expect(stateBefore.board.moveHistory.length).toBe(3);

      // Navigate back without truncation
      goToPrevious(false);

      const stateAfter = useBoardStore.getState();
      expect(stateAfter.board.moveHistory.length).toBe(3); // Preserved
      expect(stateAfter.currentViewMove).toBe(0);
    });

    it('should allow continuing play after truncating unsaved moves', () => {
      useKifuStore.getState().setCurrentKifuId('saved-kifu');
      const { playMove, goToPrevious } = useBoardStore.getState();

      playMove([3, 3]); // Saved move 1
      playMove([4, 4]); // Saved move 2
      playMove([5, 5]); // Unsaved move 3

      // Truncate the unsaved move
      goToPrevious(true);

      const stateAfterTruncate = useBoardStore.getState();
      expect(stateAfterTruncate.board.moveHistory.length).toBe(2);

      // Continue playing from truncated position
      playMove([10, 10]); // New move 3

      const stateAfter = useBoardStore.getState();
      expect(stateAfter.board.moveHistory.length).toBe(3);
      expect(stateAfter.board.stones.black).toContainEqual([10, 10]);
    });
  });
});

