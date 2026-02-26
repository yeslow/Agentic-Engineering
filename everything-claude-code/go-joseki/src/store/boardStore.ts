import { create } from 'zustand';
import type { Coordinate, StoneColor, BoardState } from '../types/go';
import { createInitialBoard, placeStone, isValidMove, toggleColor } from '../lib/goLogic';

interface BoardStore {
  board: BoardState;
  currentColor: StoneColor;
  hoverCoord: Coordinate | null;
  currentViewMove: number;
  isViewingMode: boolean;

  // Actions
  initBoard: (size?: 9 | 13 | 19) => void;
  playMove: (coord: Coordinate) => boolean;
  setHoverCoord: (coord: Coordinate | null) => void;
  resetBoard: () => void;
  undo: () => void;
  loadBoard: (newBoard: BoardState) => void;
  canPlayAt: (coord: Coordinate) => boolean;
  goToMove: (index: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToLastMove: () => void;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: createInitialBoard(19),
  currentColor: 'black',
  hoverCoord: null,
  currentViewMove: 0,
  isViewingMode: false,

  initBoard: (size = 19) => {
    set({
      board: createInitialBoard(size),
      currentColor: 'black',
      hoverCoord: null,
      currentViewMove: 0,
      isViewingMode: false,
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
        currentViewMove: newBoard.moveHistory.length,
        isViewingMode: false,
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
      currentViewMove: 0,
      isViewingMode: false,
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
      currentViewMove: previousMoves.length,
      isViewingMode: false,
    });
  },

  loadBoard: (newBoard: BoardState) => {
    // Determine current color based on move count
    const currentColor = newBoard.moveHistory.length % 2 === 0 ? 'black' : 'white';
    set({
      board: newBoard,
      currentColor,
      hoverCoord: null,
      currentViewMove: newBoard.moveHistory.length,
      isViewingMode: false,
    });
  },

  goToMove: (index: number) => {
    const { board } = get();
    const targetIndex = Math.max(0, Math.min(index, board.moveHistory.length));

    // Replay moves up to target index
    const newBoard = createInitialBoard(board.size);
    let tempBoard = newBoard;
    for (let i = 0; i < targetIndex; i++) {
      const move = board.moveHistory[i];
      tempBoard = placeStone(tempBoard, move.coordinate, move.color);
    }

    // Determine current color based on move count
    const currentColor = targetIndex % 2 === 0 ? 'black' : 'white';

    set({
      board: {
        ...tempBoard,
        moveHistory: board.moveHistory, // Preserve full history
        currentMoveNumber: targetIndex,
      },
      currentColor,
      currentViewMove: targetIndex,
      isViewingMode: targetIndex < board.moveHistory.length,
    });
  },

  goToPrevious: () => {
    const { currentViewMove } = get();
    if (currentViewMove > 0) {
      get().goToMove(currentViewMove - 1);
    }
  },

  goToNext: () => {
    const { currentViewMove, board } = get();
    if (currentViewMove < board.moveHistory.length) {
      get().goToMove(currentViewMove + 1);
    }
  },

  goToLastMove: () => {
    const { board } = get();
    get().goToMove(board.moveHistory.length);
  },

  canPlayAt: (coord: Coordinate) => {
    const { board, currentColor } = get();
    return isValidMove(board, coord, currentColor);
  },
}));
