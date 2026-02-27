import type { BoardState, Move, StoneColor, Coordinate } from '../types/go';
import { createInitialBoard, placeStone } from './goLogic';

/**
 * Convert board coordinate to SGF format (lowercase letters: a, b, c, ...)
 * SGF uses 'a' for position 0, 'b' for position 1, etc.
 */
function coordToSgf(coord: Coordinate): string {
  const [x, y] = coord;
  const letters = 'abcdefghijklmnopqrstuvwxy';
  return letters[x] + letters[y];
}

/**
 * Convert SGF coordinate to board coordinate
 */
function sgfToCoord(sgf: string): Coordinate {
  const letters = 'abcdefghijklmnopqrstuvwxy';
  const x = letters.indexOf(sgf[0]);
  const y = letters.indexOf(sgf[1]);
  if (x === -1 || y === -1) {
    throw new Error(`Invalid SGF coordinate: ${sgf}`);
  }
  return [x, y];
}

/**
 * Convert StoneColor to SGF color code
 */
function colorToSgf(color: StoneColor): 'B' | 'W' {
  return color === 'black' ? 'B' : 'W';
}

/**
 * Convert SGF color code to StoneColor
 */
function sgfToColor(code: string): StoneColor {
  return code === 'B' ? 'black' : 'white';
}

/**
 * Escape special characters in SGF property values
 */
function escapeSgfValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\]/g, '\\]').replace(/\n/g, '\\n');
}

/**
 * Unescape special characters in SGF property values
 */
function unescapeSgfValue(value: string): string {
  return value.replace(/\\\\/g, '\\').replace(/\\\]/g, ']').replace(/\\n/g, '\n');
}

/**
 * Convert BoardState to SGF format string
 *
 * SGF Format Example:
 * (;FF[4]GM[1]SZ[19]PB[Black Player]PW[White Player]AP[GoJoseki]
 * ;B[dd];W[dp];B[pd];W[dc];B[ec];W[ed]
 * )
 */
export function boardToSgf(board: BoardState, options?: {
  blackPlayer?: string;
  whitePlayer?: string;
}): string {
  const moves = board.moveHistory;
  let gameInfo = `(;FF[4]GM[1]SZ[${board.size}]`;

  // Add player names if provided
  if (options?.blackPlayer) {
    gameInfo += `PB[${escapeSgfValue(options.blackPlayer)}]`;
  }
  if (options?.whitePlayer) {
    gameInfo += `PW[${escapeSgfValue(options.whitePlayer)}]`;
  }

  gameInfo += `AP[GoJoseki]`;

  // Add capture information as comments in the root node
  const blackCaptures = board.captures.black;
  const whiteCaptures = board.captures.white;

  let gameInfoEnd = '';
  if (blackCaptures > 0 || whiteCaptures > 0) {
    gameInfoEnd = `C[Black captures: ${blackCaptures}, White captures: ${whiteCaptures}]`;
  }

  let result = gameInfo + gameInfoEnd;

  // Add each move as a node
  for (const move of moves) {
    const color = colorToSgf(move.color);
    const coord = coordToSgf(move.coordinate);
    const comment = move.comment ? `C[${escapeSgfValue(move.comment)}]` : '';
    result += `;${color}[${coord}]${comment}`;
  }

  result += ')';

  return result;
}

/**
 * Parse SGF string to BoardState
 */
export function sgfToBoard(sgf: string): {
  board: BoardState;
  blackPlayer?: string;
  whitePlayer?: string;
} {
  // Remove whitespace outside of nodes
  const trimmed = sgf.trim();

  // Extract root node - match (; followed by properties until first ; or )
  const rootMatch = trimmed.match(/^\(\s*;([A-Z][^\s;]*)/);
  if (!rootMatch) {
    throw new Error('Invalid SGF format: missing root node');
  }

  // Parse root properties
  const rootProps: Record<string, string> = {};
  const rootContent = rootMatch[0];
  const propRegex = /([A-Z]+)\[([^\]]*)\]/g;
  let match;
  while ((match = propRegex.exec(rootContent)) !== null) {
    rootProps[match[1]] = unescapeSgfValue(match[2]);
  }

  // Get board size
  const size = parseInt(rootProps['SZ'] || '19', 10) as 9 | 13 | 19;

  // Get player names
  const blackPlayer = rootProps['PB'];
  const whitePlayer = rootProps['PW'];

  // Parse all nodes (moves) - each node starts with ; followed by properties
  // Match ;B[xx] or ;W[xx] with optional C[...] comment
  const nodeRegex = /;([BW])\[([a-y]{2})\](?:C\[([^\]]*)\])?/g;
  const moves: Move[] = [];
  let moveNumber = 0;

  while ((match = nodeRegex.exec(trimmed)) !== null) {
    const color = sgfToColor(match[1]);
    const coord = sgfToCoord(match[2]);
    const comment = match[3] ? unescapeSgfValue(match[3]) : undefined;

    moves.push({
      coordinate: coord,
      color,
      moveNumber: ++moveNumber,
      comment,
    });
  }

  // Replay moves to reconstruct board state
  let board = createInitialBoard(size);

  // Parse captures from root comment if available
  if (rootProps['C']) {
    const captureMatch = rootProps['C'].match(/Black captures: (\d+), White captures: (\d+)/);
    if (captureMatch) {
      board.captures.black = parseInt(captureMatch[1], 10);
      board.captures.white = parseInt(captureMatch[2], 10);
    }
  }

  // Replay moves to build board state (stones, captures, etc.)
  // Use placeStone which will correctly track currentMoveNumber
  const successfulMoves: Move[] = [];
  for (const move of moves) {
    try {
      board = placeStone(board, move.coordinate, move.color);
      // Track successful moves with their comments
      successfulMoves.push({
        coordinate: move.coordinate,
        color: move.color,
        moveNumber: successfulMoves.length + 1,
        comment: move.comment,
      });
    } catch (e) {
      // Ignore invalid moves during replay
      console.warn('Skipping invalid move during SGF replay:', move, e);
    }
  }

  // Use only successfully played moves
  board.moveHistory = successfulMoves;

  return {
    board,
    blackPlayer,
    whitePlayer,
  };
}

/**
 * Check if a string is valid SGF format
 */
export function isValidSgf(sgf: string): boolean {
  try {
    sgfToBoard(sgf);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get metadata from SGF string
 */
export function getSgfMetadata(sgf: string): {
  size: number;
  moveCount: number;
  hasCaptures: boolean;
} {
  const result = sgfToBoard(sgf);
  const board = result.board;
  return {
    size: board.size,
    moveCount: board.moveHistory.length,
    hasCaptures: board.captures.black > 0 || board.captures.white > 0,
  };
}
