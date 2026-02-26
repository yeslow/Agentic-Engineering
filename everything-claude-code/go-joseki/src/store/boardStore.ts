import { create } from 'zustand';
import type { Coordinate, StoneColor, BoardState, GameMode } from '../types/go';
import { createInitialBoard, placeStone, isValidMove, toggleColor, getCapturedStones, countLiberties } from '../lib/goLogic';

interface TrialStones {
  black: Coordinate[];
  white: Coordinate[];
}

interface TrialCaptures {
  black: Coordinate[];
  white: Coordinate[];
}

interface TrialMove {
  coordinate: Coordinate;
  color: StoneColor;
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
  trialModeEntryMove: number;
  trialMoveHistory: TrialMove[];

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
  getTotalMoves: () => number;
  getCurrentTrialMoveIndex: () => number;
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
  trialModeEntryMove: 0,
  trialMoveHistory: [],

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
      trialModeEntryMove: 0,
      trialMoveHistory: [],
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

    set((state) => ({
      trialStones: newTrialStones,
      trialMoveCount: state.trialMoveCount + 1,
      trialCapturedStones: newTrialCapturedStones,
      trialKoPoint: newTrialKoPoint,
      trialMoveHistory: [
        ...state.trialMoveHistory,
        { coordinate: coord, color: trialColor },
      ],
    }));
    return true;
  },

  undoTrialMove: () => {
    const { trialStones, trialMoveCount, trialCapturedStones, trialMoveHistory } = get();

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
    const newTrialCapturedStones: TrialCaptures = {
      black: [...trialCapturedStones.black],
      white: [...trialCapturedStones.white],
    };

    // Clear captures for the last move color
    newTrialCapturedStones[lastColor] = [];

    // Remove last move from history
    const newTrialMoveHistory = trialMoveHistory.slice(0, -1);

    set({
      trialStones: newTrialStones,
      trialMoveCount: trialMoveCount - 1,
      trialCapturedStones: newTrialCapturedStones,
      trialKoPoint: null,
      trialMoveHistory: newTrialMoveHistory,
    });
  },

  clearTrialStones: () => {
    set({
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
      trialMoveHistory: [],
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
      trialModeEntryMove: 0,
      trialMoveHistory: [],
    });
  },

  enterTrialMode: () => {
    const { currentViewMove } = get();
    set({
      gameMode: 'trial',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
      trialModeEntryMove: currentViewMove,
      trialMoveHistory: [],
    });
  },

  exitTrialMode: () => {
    const { trialModeEntryMove } = get();
    set({
      gameMode: 'battle',
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
      currentViewMove: trialModeEntryMove,
      trialModeEntryMove: 0,
      trialMoveHistory: [],
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
      trialModeEntryMove: 0,
      trialMoveHistory: [],
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
      trialModeEntryMove: 0,
      trialMoveHistory: [],
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
      trialModeEntryMove: 0,
      trialMoveHistory: [],
    });
  },

  goToMove: (index: number) => {
    const { board, gameMode, trialModeEntryMove, trialMoveHistory } = get();
    const targetIndex = Math.max(0, Math.min(index, board.moveHistory.length + trialMoveHistory.length));

    // In trial mode, handle navigation differently
    if (gameMode === 'trial') {
      if (targetIndex <= trialModeEntryMove) {
        // Navigate to board move - but stay in trial mode
        const newBoard = createInitialBoard(board.size);
        let tempBoard = newBoard;
        for (let i = 0; i < targetIndex; i++) {
          const move = board.moveHistory[i];
          tempBoard = placeStone(tempBoard, move.coordinate, move.color);
        }

        const currentColor = targetIndex % 2 === 0 ? 'black' : 'white';
        const isViewing = targetIndex < board.moveHistory.length;

        // Stay in trial mode, preserve trialModeEntryMove
        set({
          board: {
            ...tempBoard,
            moveHistory: board.moveHistory,
            currentMoveNumber: targetIndex,
          },
          currentColor,
          currentViewMove: targetIndex,
          isViewingMode: isViewing,
          gameMode: 'trial', // Stay in trial mode
          trialStones: { black: [], white: [] },
          trialMoveCount: 0,
          trialCapturedStones: { black: [], white: [] },
          trialKoPoint: null,
          trialModeEntryMove, // Preserve entry move
          trialMoveHistory: [],
        });
      } else {
        // Navigate within trial moves - keep only moves up to targetIndex
        const movesToKeep = targetIndex - trialModeEntryMove;
        const newTrialMoveHistory = trialMoveHistory.slice(0, movesToKeep);

        // Rebuild trialStones from the kept moves
        const newTrialStones: TrialStones = { black: [], white: [] };
        for (let i = 0; i < newTrialMoveHistory.length; i++) {
          const move = newTrialMoveHistory[i];
          if (move.color === 'black') {
            newTrialStones.black.push(move.coordinate);
          } else {
            newTrialStones.white.push(move.coordinate);
          }
        }

        set({
          trialStones: newTrialStones,
          trialMoveCount: newTrialMoveHistory.length,
          trialMoveHistory: newTrialMoveHistory,
          trialCapturedStones: { black: [], white: [] }, // Simplified: clear captures on navigation
          trialKoPoint: null,
        });
      }
      return;
    }

    // Battle mode - original behavior
    const newBoard = createInitialBoard(board.size);
    let tempBoard = newBoard;
    for (let i = 0; i < targetIndex; i++) {
      const move = board.moveHistory[i];
      tempBoard = placeStone(tempBoard, move.coordinate, move.color);
    }

    // Determine current color based on move count
    const currentColor = targetIndex % 2 === 0 ? 'black' : 'white';

    // Check if viewing historical position (not at the end of move history)
    const isViewing = targetIndex < board.moveHistory.length;

    // Keep battle mode when navigating, GoBoard click handler will decide
    // whether to enter trial mode based on if there are more moves in history
    set({
      board: {
        ...tempBoard,
        moveHistory: board.moveHistory, // Preserve full history
        currentMoveNumber: targetIndex,
      },
      currentColor,
      currentViewMove: targetIndex,
      isViewingMode: isViewing,
      gameMode: 'battle', // Always stay in battle mode when navigating
      trialStones: { black: [], white: [] },
      trialMoveCount: 0,
      trialCapturedStones: { black: [], white: [] },
      trialKoPoint: null,
      trialModeEntryMove: 0,
      trialMoveHistory: [],
    });
  },

  goToPrevious: () => {
    const { currentViewMove, gameMode, trialModeEntryMove, trialMoveCount } = get();
    if (gameMode === 'trial') {
      // In trial mode, use current trial move index
      const currentIndex = trialModeEntryMove + trialMoveCount;
      if (currentIndex > 0) {
        if (currentIndex < trialModeEntryMove) {
          // Navigate board history (only if we've already navigated back in board)
          get().goToMove(currentIndex - 1);
        } else if (currentIndex > trialModeEntryMove) {
          // Remove trial moves
          get().undoTrialMove();
        }
        // If currentIndex === trialModeEntryMove, do nothing (no trial moves to undo)
      }
    } else {
      if (currentViewMove > 0) {
        get().goToMove(currentViewMove - 1);
      }
    }
  },

  goToNext: () => {
    const { currentViewMove, board, gameMode, trialModeEntryMove, trialMoveHistory } = get();
    if (gameMode === 'trial') {
      const currentIndex = trialModeEntryMove + trialMoveHistory.length;
      const totalMoves = board.moveHistory.length + trialMoveHistory.length;
      if (currentIndex < totalMoves) {
        // Can't go next in trial mode via button - user plays moves manually
        // This is a limitation - navigation in trial mode is primarily via playing moves
      }
    } else {
      if (currentViewMove < board.moveHistory.length) {
        get().goToMove(currentViewMove + 1);
      }
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

  getTotalMoves: () => {
    const { board, gameMode, trialModeEntryMove, trialMoveHistory } = get();
    if (gameMode === 'trial') {
      // In trial mode, total moves = entry move + trial moves
      return trialModeEntryMove + trialMoveHistory.length;
    }
    return board.moveHistory.length;
  },

  getCurrentTrialMoveIndex: () => {
    const { gameMode, currentViewMove, trialModeEntryMove, trialMoveCount } = get();
    if (gameMode === 'trial') {
      return trialModeEntryMove + trialMoveCount;
    }
    return currentViewMove;
  },
}));
