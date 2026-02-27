import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GoBoard } from './GoBoard';
import { useBoardStore } from '../../store/boardStore';
import { useKifuStore } from '../../store/kifuStore';

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
  });
});
