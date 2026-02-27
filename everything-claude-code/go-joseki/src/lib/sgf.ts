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
  winner?: string;
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

  // Add winner information if provided
  if (options?.winner) {
    gameInfo += `RE[${escapeSgfValue(options.winner)}]`;
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
 * Only parses the main line (first variation), ignores all other variations
 */
export function sgfToBoard(sgf: string): {
  board: BoardState;
  blackPlayer?: string;
  whitePlayer?: string;
  winner?: string;
} {
  // Remove whitespace outside of nodes
  const trimmed = sgf.trim();

  // Extract root node - match (; followed by properties until next node (;), variation (, or end of tree ()
  // SGF format: (;FF[4]GM[1]SZ[19]PB[Black]PW[White]...)
  // Also handles format where all moves are in first variation: (;FF[4]...(;B[dd];W[dp]))
  const rootMatch = trimmed.match(/^\(\s*;([^\(]*?)(?=;|\(|\))/);
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
  const winner = rootProps['RE']; // Result property (e.g., "B+R" for Black wins by resignation)

  // Parse main line only - extract the main tree content before any variations
  // Variations are enclosed in parentheses (
  // We need to find the main line by traversing the tree structure
  const mainLine = extractMainLine(trimmed);

  // Parse all nodes (moves) in main line - each node starts with ; followed by properties
  // Match ;B[xx] or ;W[xx] with optional C[...] comment
  const nodeRegex = /;([BW])\[([a-y]{2})\](?:C\[([^\]]*)\])?/g;
  const moves: Move[] = [];
  let moveNumber = 0;

  while ((match = nodeRegex.exec(mainLine)) !== null) {
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
    winner,
  };
}

/**
 * Extract the main line from SGF content
 * The main line is the first sequence of moves, ignoring all other variations in parentheses
 *
 * Special case: If the main line has no moves but the first variation does,
 * use the first variation as the main line (some SGF files use this format)
 *
 * Special case 2: If each move is followed by a variation (nested format),
 * recursively extract the main line from the first variation chain
 */
function extractMainLine(sgf: string): string {
  let result = '';
  let depth = 0;
  let inVariation = false;
  let firstVariationStart = -1;
  let firstVariationEnd = -1;

  for (let i = 0; i < sgf.length; i++) {
    const char = sgf[i];

    if (char === '(') {
      depth++;
      // Track the start of the first variation
      if (depth === 2 && firstVariationStart === -1) {
        firstVariationStart = i;
        inVariation = true;
      } else if (depth > 1 && !inVariation) {
        inVariation = true;
      }
    } else if (char === ')') {
      depth--;
      // Track the end of the first variation
      if (depth === 1 && firstVariationStart !== -1 && firstVariationEnd === -1) {
        firstVariationEnd = i;
      }
      if (depth < 2) {
        inVariation = false;
      }
    } else if (!inVariation) {
      // Only add characters from the main line
      result += char;
    }
  }

  // Check if the main line has any moves
  const moveRegex = /;([BW])\[([a-y]{2})\]/;
  const hasMoves = moveRegex.test(result);

  // If main line has no moves but first variation does, use first variation
  if (!hasMoves && firstVariationStart !== -1 && firstVariationEnd !== -1) {
    const firstVariation = sgf.substring(firstVariationStart, firstVariationEnd + 1);
    const variationHasMoves = moveRegex.test(firstVariation);
    if (variationHasMoves) {
      // Extract content from first variation (remove outer parentheses)
      return firstVariation.substring(1, firstVariation.length - 1);
    }
  }

  // Special case 2: If main line has very few moves but first variation has more,
  // this might be the "nested format" where each move is followed by a variation
  // In this case, we need to chain through variations to get the full main line
  if (firstVariationStart !== -1 && firstVariationEnd !== -1) {
    const firstVariation = sgf.substring(firstVariationStart + 1, firstVariationEnd);
    const variationMoves = (firstVariation.match(/;([BW])\[([a-y]{2})\]/g) || []).length;
    const mainLineMoves = (result.match(/;([BW])\[([a-y]{2})\]/g) || []).length;

    // If variation has significantly more moves, use the recursive extraction
    if (variationMoves > mainLineMoves) {
      const mainLineMovesInRoot = result.match(/;([BW])\[([a-y]{2})\]/g) || [];
      const chainedMainLine = extractChainedMainLine(sgf, firstVariationStart, firstVariationEnd);
      if (chainedMainLine) {
        // Prepend any moves found in the root node (before the variation)
        return mainLineMovesInRoot.join('') + chainedMainLine;
      }
    }
  }

  return result;
}

/**
 * Extract main line from SGF files where each move is followed by a nested variation
 * This handles the format: (;...;B[aa](;W[bb](;B[cc]...)))
 * by recursively chaining through the first variation of each node
 */
function extractChainedMainLine(sgf: string, varStart: number, varEnd: number): string | null {
  const moveRegex = /;([BW])\[([a-y]{2})\]/g;
  let result = '';
  let currentPos = varStart + 1; // Start after the opening '('

  // Find the first move in the variation
  moveRegex.lastIndex = currentPos;
  let moveMatch = moveRegex.exec(sgf);

  if (!moveMatch || moveMatch.index >= varEnd) {
    return null;
  }

  // Process moves by chaining through first variations
  while (moveMatch && moveMatch.index < varEnd) {
    // Add this move to result
    const moveEnd = moveMatch.index + moveMatch[0].length;
    result += sgf.substring(moveMatch.index, moveEnd);

    // Check if there's a variation immediately after this move
    const afterMove = sgf.substring(moveEnd, Math.min(moveEnd + 2, varEnd));
    if (afterMove.startsWith('(;')) {
      // Find the matching closing paren for this variation
      let parenDepth = 0;
      let varEndPos = moveEnd;
      for (let i = moveEnd; i < varEnd; i++) {
        if (sgf[i] === '(') parenDepth++;
        if (sgf[i] === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            varEndPos = i;
            break;
          }
        }
      }

      // Move into the first variation and continue
      // Find the next move within this variation
      moveRegex.lastIndex = moveEnd + 1;
      moveMatch = moveRegex.exec(sgf);

      if (!moveMatch || moveMatch.index >= varEndPos) {
        break;
      }

      // Update search boundaries for next iteration
      varEnd = varEndPos;
    } else {
      break;
    }
  }

  return result.length > 0 ? result : null;
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
