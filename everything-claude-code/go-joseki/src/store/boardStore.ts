import { create } from 'zustand';
import type { Coordinate, StoneColor, BoardState, GameMode } from '../types/go';
import { createInitialBoard, placeStone, isValidMove, toggleColor, getCapturedStones, countLiberties } from '../lib/goLogic';

interface TrialStones {
  black: Coordinate[];
  white: Coordinate[];
}

// Tracks stones captured during trial mode
interface TrialCaptures {
  black: Coordinate[]; // white stones captured by black trial moves
  white: Coordinate[]; // black stones captured by white trial moves
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
  trialCapturedStones: TrialCaptures;
  trialKoPoint: Coordinate | null;

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
  trialCapturedStones: { black: [], white: [] },
  trialKoPoint: null,

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
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
    const { board, trialStones, trialMoveCount, trialCapturedStones } = get();

    // Check if spot is occupied in main board or trial stones (excluding captured stones)
    const isBlackBoardOccupied =
      board.stones.black.some(([x, y]) => x === coord[0] && y === coord[1]) &&
      !trialCapturedStones.white.some(([cx, cy]) => cx === coord[0] && cy === coord[1]);

    const isWhiteBoardOccupied =
      board.stones.white.some(([x, y]) => x === coord[0] && y === coord[1]) &&
      !trialCapturedStones.black.some(([cx, cy]) => cx === coord[0] && cy === coord[1]);

    // Check if spot is occupied by trial stones (excluding captured trial stones)
    const isTrialBlackOccupied =
      trialStones.black.some(([x, y]) => x === coord[0] && y === coord[1]) &&
      !trialCapturedStones.white.some(([cx, cy]) => cx === coord[0] && cy === coord[1]);

    const isTrialWhiteOccupied =
      trialStones.white.some(([x, y]) => x === coord[0] && y === coord[1]) &&
      !trialCapturedStones.black.some(([cx, cy]) => cx === coord[0] && cy === coord[1]);

    const isOnTrialOccupied = isTrialBlackOccupied || isTrialWhiteOccupied;

    if (isBlackBoardOccupied || isWhiteBoardOccupied || isOnTrialOccupied) {
      console.warn('Spot is occupied');
      return false;
    }

    // Determine color based on board state + trial moves
    // Use currentMoveNumber to handle viewing mode correctly
    const boardMoveCount = board.currentMoveNumber;
    const trialColor: StoneColor = (boardMoveCount + trialMoveCount) % 2 === 0 ? 'black' : 'white';

    // Check for ko - cannot retake immediately
    const { trialKoPoint } = get();
    if (trialKoPoint && trialKoPoint[0] === coord[0] && trialKoPoint[1] === coord[1]) {
      console.warn('Ko: cannot retake immediately in trial mode');
      return false;
    }

    // Build a simulated board state that includes trial stones
    // and excludes already captured stones
    const simulatedBoard: BoardState = {
      ...board,
      stones: {
        black: [...board.stones.black, ...trialStones.black].filter(
          ([x, y]) => !trialCapturedStones.white.some(([cx, cy]) => cx === x && cy === y)
        ),
        white: [...board.stones.white, ...trialStones.white].filter(
          ([x, y]) => !trialCapturedStones.black.some(([cx, cy]) => cx === x && cy === y)
        ),
      },
    };

    // Check for captured stones using the existing logic
    const captured = getCapturedStones(simulatedBoard, coord, trialColor);

    // Filter out captured stones that are already in trialCapturedStones
    const newCaptures = captured.filter(
      ([cx, cy]) =>
        !trialCapturedStones[trialColor].some(([tcx, tcy]) => tcx === cx && tcy === cy)
    );

    const newTrialStones: TrialStones = {
      black: trialStones.black.filter(([x, y]) => !(x === coord[0] && y === coord[1])),
      white: trialStones.white.filter(([x, y]) => !(x === coord[0] && y === coord[1])),
    };

    if (trialColor === 'black') {
      newTrialStones.black.push(coord);
    } else {
      newTrialStones.white.push(coord);
    }

    // Update captured stones - add opponent stones captured by this trial move
    const opponent = trialColor === 'black' ? 'white' : 'black';
    const newTrialCapturedStones: TrialCaptures = {
      // Remove this position from opponent's captures (if it was captured before)
      black: trialCapturedStones.black.filter(([x, y]) => !(x === coord[0] && y === coord[1])),
      white: trialCapturedStones.white.filter(([x, y]) => !(x === coord[0] && y === coord[1])),
    };

    // Add newly captured opponent stones
    for (const capture of newCaptures) {
      newTrialCapturedStones[trialColor].push(capture);
    }

    // Calculate ko point
    // Ko happens when: we capture exactly 1 stone, and after capture,
    // our new stone has exactly 1 liberty (the captured position)
    let newTrialKoPoint: Coordinate | null = null;
    if (newCaptures.length === 1) {
      // Build board after this move to check liberties
      const afterMoveBoard: BoardState = {
        ...simulatedBoard,
        stones: {
          ...simulatedBoard.stones,
          [trialColor]: [...simulatedBoard.stones[trialColor], coord],
          [opponent]: simulatedBoard.stones[opponent].filter(
            ([ox, oy]) => !(ox === newCaptures[0][0] && oy === newCaptures[0][1])
          ),
        },
      };
      // Check liberties of the new stone
      const liberties = countLiberties(afterMoveBoard, coord);
      if (liberties === 1) {
        newTrialKoPoint = newCaptures[0];
      }
    }

    set({
      trialStones: newTrialStones,
      trialMoveCount: trialMoveCount + 1,
      trialCapturedStones: newTrialCapturedStones,
      trialKoPoint: newTrialKoPoint,
    });
    return true;
  },

  undoTrialMove: () => {
    const { trialStones, trialMoveCount, trialCapturedStones } = get();

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

    // Remove captures made by this color's last move
    // We need to recalculate captures to know what to remove
    // For simplicity, we keep track of all captures per color and clear them on undo
    // A more sophisticated approach would store captures per move
    const newTrialCapturedStones: TrialCaptures = {
      black: [...trialCapturedStones.black],
      white: [...trialCapturedStones.white],
    };

    // Clear captures for the last move color (they would have made captures)
    // Note: This is a simplification - ideally we'd track which captures belong to which move
    // For now, just clear all captures for this color when undoing
    newTrialCapturedStones[lastColor] = [];

    set({
      trialStones: newTrialStones,
      trialMoveCount: trialMoveCount - 1,
      trialCapturedStones: newTrialCapturedStones,
      trialKoPoint: null, // Clear ko point on undo
    });
  },

  clearTrialStones: () => {
    set({
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
    });
  },

  setGameMode: (mode: GameMode) => {
    // Clear trial stones when changing mode
    set({
      gameMode: mode,
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
    });
  },

  enterTrialMode: () => {
    set({
      gameMode: 'trial',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
    });
  },

  exitTrialMode: () => {
    set({
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
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
