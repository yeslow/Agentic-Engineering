import type { Joseki } from '../data/joseki';
import type { Coordinate, Move } from '../types/go';

export interface PracticeSession {
  josekiId: string;
  currentMoveIndex: number;
  userMoves: Coordinate[];
  hintsUsed: number;
  mistakes: number;
  isComplete: boolean;
}

export interface MoveResult {
  isCorrect: boolean;
  nextMove?: Move;
  correctMove?: Move;
  message?: string;
}

export interface Hint {
  coordinate: Coordinate;
  message: string;
}

/**
 * Create a new practice session for a joseki
 */
export function createPracticeSession(joseki: Joseki): PracticeSession {
  return {
    josekiId: joseki.id,
    currentMoveIndex: 0,
    userMoves: [],
    hintsUsed: 0,
    mistakes: 0,
    isComplete: false,
  };
}

/**
 * Check if user's move is correct
 */
export function checkUserMove(
  session: PracticeSession,
  joseki: Joseki,
  coordinate: Coordinate
): MoveResult {
  if (session.isComplete) {
    return { isCorrect: false, message: '定式已完成' };
  }

  const expectedMove = joseki.mainLine[session.currentMoveIndex];

  // Check if move matches
  const isCorrect =
    expectedMove.coordinate[0] === coordinate[0] &&
    expectedMove.coordinate[1] === coordinate[1];

  if (isCorrect) {
    session.userMoves.push(coordinate);
    session.currentMoveIndex++;

    // Check if joseki is complete
    if (session.currentMoveIndex >= joseki.mainLine.length) {
      session.isComplete = true;
    }

    // Get next move for opponent (if any)
    const nextMove = joseki.mainLine[session.currentMoveIndex];

    return {
      isCorrect: true,
      nextMove,
      message: expectedMove.comment || '正确！',
    };
  } else {
    session.mistakes++;
    return {
      isCorrect: false,
      correctMove: expectedMove,
      message: `不正确。正确的下法是 ${coordinateToLabel(expectedMove.coordinate)}`,
    };
  }
}

/**
 * Get hint for current move
 */
export function getHint(session: PracticeSession, joseki: Joseki): Hint | null {
  if (session.isComplete || session.currentMoveIndex >= joseki.mainLine.length) {
    return null;
  }

  const currentMove = joseki.mainLine[session.currentMoveIndex];
  session.hintsUsed++;

  return {
    coordinate: currentMove.coordinate,
    message: currentMove.comment || `建议下在 ${coordinateToLabel(currentMove.coordinate)}`,
  };
}

/**
 * Check if joseki practice is complete
 */
export function isJosekiComplete(session: PracticeSession, joseki: Joseki): boolean {
  return session.currentMoveIndex >= joseki.mainLine.length;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(session: PracticeSession, joseki: Joseki): number {
  const totalMoves = joseki.mainLine.length;
  if (totalMoves === 0) return 100;

  // Each mistake reduces accuracy
  const mistakePenalty = session.mistakes * 10;
  const hintPenalty = session.hintsUsed * 5;

  let accuracy = 100 - mistakePenalty - hintPenalty;
  return Math.max(0, Math.min(100, accuracy));
}

/**
 * Convert coordinate to human-readable label (e.g., "C4")
 */
function coordinateToLabel(coord: Coordinate): string {
  const [x, y] = coord;
  const col = String.fromCharCode(65 + x); // A, B, C...
  const row = 19 - y; // 19, 18, 17... (for 19x19 board)
  return `${col}${row}`;
}
