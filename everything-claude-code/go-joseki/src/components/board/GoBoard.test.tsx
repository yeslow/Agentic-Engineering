import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GoBoard } from './GoBoard';
import { useBoardStore } from '../../store/boardStore';
import { useKifuStore } from '../../store/kifuStore';

// Helper to simulate clicking on canvas center (approximate 19x19 board position)
const clickOnCanvas = (canvas: HTMLElement, x: number, y: number) => {
  fireEvent.click(canvas, { clientX: x, clientY: y });
};

// Mock canvas context
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array() })),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0, height: 0 })),
    rotate: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    set fillStyle(_: string) {},
    set strokeStyle(_: string) {},
    set lineWidth(_: number) {},
    set font(_: string) {},
    set textAlign(_: string) {},
    set textBaseline(_: string) {},
  });
});

describe('GoBoard', () => {
  beforeEach(() => {
    // Reset stores before each test
    useBoardStore.getState().initBoard(19);
    useKifuStore.getState().setCurrentKifuId(null);
  });

  describe('click on board in battle mode', () => {
    it('should NOT enter trial mode when board is empty (no stones)', () => {
      // Arrange: Initialize empty board in battle mode
      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Verify initial state: battle mode, no stones
      const store = useBoardStore.getState();
      expect(store.gameMode).toBe('battle');
      expect(store.board.stones.black.length).toBe(0);
      expect(store.board.stones.white.length).toBe(0);

      // Act: Click on the board (center area)
      fireEvent.click(canvas!, {
        clientX: 200,
        clientY: 200,
      });

      // Assert: Should NOT enter trial mode, gameMode should remain 'battle'
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.trialMoveCount).toBe(0);
    });

    it('should NOT enter trial mode after resetBoard (empty board)', () => {
      // Arrange: Set up board with stones, then reset
      const store = useBoardStore.getState();
      store.playMove([3, 3]);
      store.playMove([15, 15]);
      store.resetBoard();

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Verify board is empty
      expect(store.gameMode).toBe('battle');
      expect(store.board.stones.black.length).toBe(0);
      expect(store.board.stones.white.length).toBe(0);

      // Act: Click on the board
      fireEvent.click(canvas!, {
        clientX: 200,
        clientY: 200,
      });

      // Assert: Should NOT enter trial mode after reset
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.trialMoveCount).toBe(0);
    });

    it('should play normal moves on blank board (no kifu loaded)', () => {
      // Arrange: Ensure no kifu is loaded (blank board)
      expect(useKifuStore.getState().currentKifuId).toBeNull();

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click on the board multiple times
      clickOnCanvas(canvas!, 200, 200);
      clickOnCanvas(canvas!, 220, 220);

      // Assert: Should have played normal moves, not entered trial mode
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.board.moveHistory).toHaveLength(2);
      expect(stateAfter.board.stones.black).toHaveLength(1);
      expect(stateAfter.board.stones.white).toHaveLength(1);
      expect(stateAfter.trialMoveCount).toBe(0);
    });

    it('should continue playing moves after undo on blank board', () => {
      // Arrange: Play moves, then undo
      const boardStore = useBoardStore.getState();
      boardStore.playMove([3, 3]);
      boardStore.playMove([4, 4]);
      boardStore.undo();

      // Get fresh state after operations
      const stateBeforeRender = useBoardStore.getState();
      expect(stateBeforeRender.gameMode).toBe('battle');
      expect(stateBeforeRender.currentViewMove).toBe(1);

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click to continue playing
      clickOnCanvas(canvas!, 200, 200);

      // Assert: Should stay in battle mode and continue playing
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.board.moveHistory).toHaveLength(2);
      expect(stateAfter.trialMoveCount).toBe(0);
    });

    it('should NOT enter trial mode even with stones on blank board', () => {
      // Arrange: Play some moves on blank board first
      const store = useBoardStore.getState();
      store.playMove([3, 3]);
      store.playMove([4, 4]);

      // Verify no kifu is loaded
      expect(useKifuStore.getState().currentKifuId).toBeNull();
      expect(store.gameMode).toBe('battle');

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click again on the board
      clickOnCanvas(canvas!, 200, 200);

      // Assert: Should still be in battle mode (not trial)
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.board.moveHistory).toHaveLength(3);
      expect(stateAfter.trialMoveCount).toBe(0);
    });
  });

  describe('click on saved kifu', () => {
    it('should play normal moves when at latest move of saved kifu', () => {
      // Arrange: Load a saved kifu and play to the end
      useKifuStore.getState().setCurrentKifuId('test-kifu');
      const boardStore = useBoardStore.getState();
      boardStore.playMove([3, 3]);
      boardStore.playMove([4, 4]);

      // Verify at latest move - use fresh state
      const stateBeforeRender = useBoardStore.getState();
      expect(stateBeforeRender.currentViewMove).toBe(2);
      expect(stateBeforeRender.board.moveHistory.length).toBe(2);

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click on the board
      clickOnCanvas(canvas!, 200, 200);

      // Assert: Should play normal move (not enter trial mode)
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.board.moveHistory).toHaveLength(3);
    });

    it('should enter trial mode when viewing history of saved kifu', () => {
      // Arrange: Load a saved kifu and go back to middle
      useKifuStore.getState().setCurrentKifuId('test-kifu');
      const boardStore = useBoardStore.getState();
      boardStore.playMove([3, 3]);
      boardStore.playMove([4, 4]);
      boardStore.playMove([5, 5]);

      // Go back to move 1 (not at latest)
      boardStore.goToMove(1);

      // Use fresh state for assertions
      const stateBeforeRender = useBoardStore.getState();
      expect(stateBeforeRender.currentViewMove).toBe(1);
      expect(stateBeforeRender.board.moveHistory.length).toBe(3);

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click on the board
      clickOnCanvas(canvas!, 200, 200);

      // Assert: Should enter trial mode
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('trial');
      expect(stateAfter.trialMoveCount).toBe(1);
      expect(stateAfter.board.moveHistory).toHaveLength(3); // Board history unchanged
    });

    it('should return to battle mode and continue when at latest after navigation', () => {
      // Arrange: Load a saved kifu, go back, then return to latest
      useKifuStore.getState().setCurrentKifuId('test-kifu');
      const boardStore = useBoardStore.getState();
      boardStore.playMove([3, 3]);
      boardStore.playMove([4, 4]);

      // Go back then forward to latest
      boardStore.goToMove(1);
      boardStore.goToLastMove();

      // Use fresh state for assertions
      const stateBeforeRender = useBoardStore.getState();
      expect(stateBeforeRender.currentViewMove).toBe(2);
      expect(stateBeforeRender.gameMode).toBe('battle');

      const { container } = render(<GoBoard size={400} />);
      const canvas = container.querySelector('canvas');

      // Act: Click on the board
      clickOnCanvas(canvas!, 200, 200);

      // Assert: Should play normal move (not enter trial mode)
      const stateAfter = useBoardStore.getState();
      expect(stateAfter.gameMode).toBe('battle');
      expect(stateAfter.board.moveHistory).toHaveLength(3);
    });
  });
});
