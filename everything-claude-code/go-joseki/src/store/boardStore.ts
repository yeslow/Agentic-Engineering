import { create } from 'zustand';
import type { Coordinate, StoneColor, BoardState, GameMode } from '../types/go';
import { createInitialBoard, placeStone, isValidMove, toggleColor } from '../lib/goLogic';

interface TrialStones {
  black: Coordinate[];
  white: Coordinate[];
}

interface BoardStore {
  board: BoardState;
  currentColor: StoneColor;
  hoverCoord: Coordinate | null;
  currentViewMove: number;
  isViewingMode: boolean;
  gameMode: GameMode;
  trialStones: TrialStones;
  trialMoveCount: number;

  // Actions
  initBoard: (size?: 9 | 13 | 19) => void;
  playMove: (coord: Coordinate) => boolean;
  playTrialMove: (coord: Coordinate) => boolean;
  undoTrialMove: () => void;
  clearTrialStones: () => void;
  setGameMode: (mode: GameMode) => void;
  enterTrialMode: () => void;
  exitTrialMode: () => void;
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
  gameMode: 'battle',
  trialStones: { black: [], white: [] },
  trialMoveCount: 0,

  initBoard: (size = 19) => {
    set({
      board: createInitialBoard(size),
      currentColor: 'black',
      hoverCoord: null,
      currentViewMove: 0,
      isViewingMode: false,
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
    });
  },

  playMove: (coord: Coordinate) => {
    const { board, currentColor, gameMode } = get();

    // Cannot play in trial mode
    if (gameMode === 'trial') {
      console.warn('Cannot play in trial mode, use playTrialMove instead');
      return false;
    }

    try {
      const newBoard = placeStone(board, coord, currentColor);
      set({
        board: newBoard,
        currentColor: toggleColor(currentColor),
        hoverCoord: null,
        currentViewMove: newBoard.moveHistory.length,
        isViewingMode: false,
        gameMode: 'battle', // Ensure we're in battle mode after playing
      });
      return true;
    } catch (error) {
      console.warn('Invalid move:', error);
      return false;
    }
  },

  playTrialMove: (coord: Coordinate) => {
    const { board, trialStones, trialMoveCount } = get();

    // Check if spot is occupied in main board or trial stones
    const isOccupied =
      board.stones.black.some(([x, y]) => x === coord[0] && y === coord[1]) ||
      board.stones.white.some(([x, y]) => x === coord[0] && y === coord[1]) ||
      trialStones.black.some(([x, y]) => x === coord[0] && y === coord[1]) ||
      trialStones.white.some(([x, y]) => x === coord[0] && y === coord[1]);

    if (isOccupied) {
      console.warn('Spot is occupied');
      return false;
    }

    // Determine color based on trial move count (alternate black/white)
    const trialColor: StoneColor = trialMoveCount % 2 === 0 ? 'black' : 'white';
    const newTrialStones: TrialStones = {
      black: [...trialStones.black],
      white: [...trialStones.white],
    };

    if (trialColor === 'black') {
      newTrialStones.black.push(coord);
    } else {
      newTrialStones.white.push(coord);
    }

    set({
      trialStones: newTrialStones,
      trialMoveCount: trialMoveCount + 1,
    });
    return true;
  },

  undoTrialMove: () => {
    const { trialStones, trialMoveCount } = get();

    if (trialMoveCount === 0) {
      return;
    }

    // Determine the color of the last move
    const lastColor: StoneColor = (trialMoveCount - 1) % 2 === 0 ? 'black' : 'white';
    const newTrialStones: TrialStones = {
      black: [...trialStones.black],
      white: [...trialStones.white],
    };

    // Remove the last stone
    if (lastColor === 'black' && newTrialStones.black.length > 0) {
      newTrialStones.black.pop();
    } else if (lastColor === 'white' && newTrialStones.white.length > 0) {
      newTrialStones.white.pop();
    }

    set({
      trialStones: newTrialStones,
      trialMoveCount: trialMoveCount - 1,
    });
  },

  clearTrialStones: () => {
    set({
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
    });
  },

  setGameMode: (mode: GameMode) => {
    // Clear trial stones when changing mode
    set({
      gameMode: mode,
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
    });
  },

  enterTrialMode: () => {
    set({
      gameMode: 'trial',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
    });
  },

  exitTrialMode: () => {
    set({
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
    });
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
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
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
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
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
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
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

    // Auto enter trial mode when navigating to middle of game
    const isViewing = targetIndex < board.moveHistory.length;
    const newGameMode: GameMode = isViewing ? 'trial' : 'battle';

    set({
      board: {
        ...tempBoard,
        moveHistory: board.moveHistory, // Preserve full history
        currentMoveNumber: targetIndex,
      },
      currentColor,
      currentViewMove: targetIndex,
      isViewingMode: isViewing,
      gameMode: newGameMode,
      trialStones: { black: [], white: [] }, // Clear trial stones when navigating
      trialMoveCount: 0,
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
