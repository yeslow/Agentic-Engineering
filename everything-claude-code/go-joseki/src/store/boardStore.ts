import { create } from 'zustand';
import type { Coordinate, StoneColor, BoardState } from '../types/go';
import { createInitialBoard, placeStone, isValidMove, toggleColor } from '../lib/goLogic';

interface BoardStore {
  board: BoardState;
  currentColor: StoneColor;
  hoverCoord: Coordinate | null;

  // Actions
  initBoard: (size?: 9 | 13 | 19) => void;
  playMove: (coord: Coordinate) => boolean;
  setHoverCoord: (coord: Coordinate | null) => void;
  resetBoard: () => void;
  undo: () => void;
  canPlayAt: (coord: Coordinate) => boolean;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: createInitialBoard(19),
  currentColor: 'black',
  hoverCoord: null,

  initBoard: (size = 19) => {
    set({
      board: createInitialBoard(size),
      currentColor: 'black',
      hoverCoord: null,
    });
  },

  playMove: (coord: Coordinate) => {
    const { board, currentColor } = get();

    try {
      const newBoard = placeStone(board, coord, currentColor);
      set({
        board: newBoard,
        currentColor: toggleColor(currentColor),
        hoverCoord: null,
      });
      return true;
    } catch (error) {
      console.warn('Invalid move:', error);
      return false;
    }
  },

  setHoverCoord: (coord: Coordinate | null) => {
    set({ hoverCoord: coord });
  },

  resetBoard: () => {
    const { board } = get();
    set({
      board: createInitialBoard(board.size),
      currentColor: 'black',
      hoverCoord: null,
    });
  },

  undo: () => {
    const { board, currentColor } = get();
    if (board.moveHistory.length === 0) return;

    // Restore previous state from history
    const previousMoves = board.moveHistory.slice(0, -1);
    const newBoard = createInitialBoard(board.size);

    // Replay all moves except the last one
    let tempBoard = newBoard;
    for (const move of previousMoves) {
      tempBoard = placeStone(tempBoard, move.coordinate, move.color);
    }

    set({
      board: tempBoard,
      currentColor: toggleColor(currentColor),
      hoverCoord: null,
    });
  },

  canPlayAt: (coord: Coordinate) => {
    const { board, currentColor } = get();
    return isValidMove(board, coord, currentColor);
  },
}));
