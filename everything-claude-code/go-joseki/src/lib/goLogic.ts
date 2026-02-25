import type { Coordinate, StoneColor, BoardState } from '../types/go';

export function createInitialBoard(size: 9 | 13 | 19 = 19): BoardState {
  return {
    size,
    stones: {
      black: [],
      white: [],
    },
    captures: {
      black: 0,
      white: 0,
    },
    koPoint: null,
    lastMove: null,
    moveHistory: [],
    currentMoveNumber: 0,
  };
}

export function coordinateToString(coord: Coordinate): string {
  const [x, y] = coord;
  return String.fromCharCode(97 + x) + String.fromCharCode(97 + y);
}

export function stringToCoordinate(str: string): Coordinate {
  return [str.charCodeAt(0) - 97, str.charCodeAt(1) - 97];
}

export function toggleColor(color: StoneColor): StoneColor {
  return color === 'black' ? 'white' : 'black';
}

export function isValidMove(
  board: BoardState,
  coord: Coordinate,
  _color: StoneColor
): boolean {
  const [x, y] = coord;

  // Check bounds
  if (x < 0 || x >= board.size || y < 0 || y >= board.size) {
    return false;
  }

  // Check if occupied
  if (
    board.stones.black.some(([bx, by]) => bx === x && by === y) ||
    board.stones.white.some(([wx, wy]) => wx === x && wy === y)
  ) {
    return false;
  }

  // Check ko
  if (board.koPoint && board.koPoint[0] === x && board.koPoint[1] === y) {
    return false;
  }

  return true;
}

export function countLiberties(board: BoardState, coord: Coordinate): number {
  const [x, y] = coord;
  const size = board.size;
  const directions: Coordinate[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  let liberties = 0;
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
      const isOccupied =
        board.stones.black.some(([bx, by]) => bx === nx && by === ny) ||
        board.stones.white.some(([wx, wy]) => wx === nx && wy === ny);
      if (!isOccupied) {
        liberties++;
      }
    }
  }
  return liberties;
}

export function wouldBeSuicide(
  board: BoardState,
  coord: Coordinate,
  color: StoneColor
): boolean {
  const [x, y] = coord;
  const opponent = toggleColor(color);

  // Simulate placing the stone
  const simulatedBoard: BoardState = {
    ...board,
    stones: {
      ...board.stones,
      [color]: [...board.stones[color], [x, y]],
    },
  };

  // Check if the placed stone has liberties
  if (countLiberties(simulatedBoard, coord) > 0) {
    return false;
  }

  // Check if it captures opponent stones
  const directions: Coordinate[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      nx < board.size &&
      ny >= 0 &&
      ny < board.size &&
      board.stones[opponent].some(([ox, oy]) => ox === nx && oy === ny)
    ) {
      // Check if this opponent stone would be captured
      const opponentLiberties = countLiberties(simulatedBoard, [nx, ny]);
      if (opponentLiberties === 0) {
        return false; // Capture prevents suicide
      }
    }
  }

  return true;
}

function getConnectedStones(
  board: BoardState,
  coord: Coordinate,
  color: StoneColor
): Coordinate[] {
  const [sx, sy] = coord;
  const visited = new Set<string>();
  const connected: Coordinate[] = [];
  const queue: Coordinate[] = [[sx, sy]];
  const directions: Coordinate[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const key = `${cx},${cy}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // Check if this position has a stone of the given color
    const hasStone = board.stones[color].some(
      ([sx, sy]) => sx === cx && sy === cy
    );
    if (!hasStone) continue;

    connected.push([cx, cy]);

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (
        nx >= 0 &&
        nx < board.size &&
        ny >= 0 &&
        ny < board.size &&
        !visited.has(`${nx},${ny}`)
      ) {
        queue.push([nx, ny]);
      }
    }
  }

  return connected;
}

function getGroupLiberties(
  board: BoardState,
  group: Coordinate[]
): number {
  const libertySet = new Set<string>();
  const directions: Coordinate[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [sx, sy] of group) {
    for (const [dx, dy] of directions) {
      const nx = sx + dx;
      const ny = sy + dy;
      if (nx >= 0 && nx < board.size && ny >= 0 && ny < board.size) {
        const isOccupied =
          board.stones.black.some(([bx, by]) => bx === nx && by === ny) ||
          board.stones.white.some(([wx, wy]) => wx === nx && wy === ny);
        if (!isOccupied) {
          libertySet.add(`${nx},${ny}`);
        }
      }
    }
  }

  return libertySet.size;
}

export function getCapturedStones(
  board: BoardState,
  coord: Coordinate,
  color: StoneColor
): Coordinate[] {
  const [x, y] = coord;
  const opponent = toggleColor(color);
  const captured: Coordinate[] = [];
  const directions: Coordinate[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  // Simulate placing the stone
  const simulatedBoard: BoardState = {
    ...board,
    stones: {
      ...board.stones,
      [color]: [...board.stones[color], [x, y]],
    },
  };

  // Check adjacent opponent stones
  const checkedGroups = new Set<string>();
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      nx < board.size &&
      ny >= 0 &&
      ny < board.size &&
      board.stones[opponent].some(([ox, oy]) => ox === nx && oy === ny)
    ) {
      const group = getConnectedStones(simulatedBoard, [nx, ny], opponent);
      const groupKey = group.map(([gx, gy]) => `${gx},${gy}`).sort().join('|');

      if (!checkedGroups.has(groupKey)) {
        checkedGroups.add(groupKey);
        const liberties = getGroupLiberties(simulatedBoard, group);
        if (liberties === 0) {
          captured.push(...group);
        }
      }
    }
  }

  return captured;
}

export function isKo(
  board: BoardState,
  coord: Coordinate,
  _color: StoneColor
): boolean {
  // Check if this move is at the ko point
  if (!board.koPoint) {
    return false;
  }

  const [kx, ky] = board.koPoint;
  const [cx, cy] = coord;

  return kx === cx && ky === cy;
}

export function placeStone(
  board: BoardState,
  coord: Coordinate,
  color: StoneColor
): BoardState {
  if (!isValidMove(board, coord, color)) {
    throw new Error('Invalid move');
  }

  if (wouldBeSuicide(board, coord, color)) {
    throw new Error('Suicide move is not allowed');
  }

  if (isKo(board, coord, color)) {
    throw new Error('Ko: cannot retake immediately');
  }

  const [x, y] = coord;
  const captured = getCapturedStones(board, coord, color);
  const opponent = toggleColor(color);

  // Remove captured stones
  const newOpponentStones = board.stones[opponent].filter(
    ([ox, oy]) => !captured.some(([cx, cy]) => cx === ox && cy === oy)
  );

  // Add new stone
  // Check if this move creates a ko situation for opponent
  // Ko happens when: we capture exactly 1 stone, and after capture,
  // our new stone has exactly 1 liberty (the captured position)
  let koPoint: Coordinate | null = null;
  if (captured.length === 1) {
    // Simulate the board after capture to check liberties
    const afterCaptureBoard: BoardState = {
      ...board,
      stones: {
        ...board.stones,
        [color]: [...board.stones[color], [x, y]],
        [opponent]: newOpponentStones,
      },
    };
    const libertiesAfterCapture = countLiberties(afterCaptureBoard, coord);
    // If only 1 liberty and we captured 1 stone, it's ko
    if (libertiesAfterCapture === 1) {
      koPoint = captured[0];
    }
  }

  const newBoard: BoardState = {
    size: board.size,
    stones: {
      ...board.stones,
      [color]: [...board.stones[color], [x, y]],
      [opponent]: newOpponentStones,
    },
    captures: {
      ...board.captures,
      [color]: board.captures[color] + captured.length,
    },
    koPoint,
    lastMove: coord,
    moveHistory: [
      ...board.moveHistory,
      {
        coordinate: coord,
        color,
        moveNumber: board.currentMoveNumber + 1,
      },
    ],
    currentMoveNumber: board.currentMoveNumber + 1,
  };

  return newBoard;
}
