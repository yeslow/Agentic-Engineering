import type { Coordinate, StoneColor } from '../types/go';

export interface BoardDimensions {
  width: number;
  height: number;
  gridSize: number;
  cellSize: number;
  stoneRadius: number;
  padding: number;
}

/**
 * Calculate board dimensions based on canvas size and board size
 */
export function calculateBoardDimensions(
  canvasWidth: number,
  boardSize: number
): BoardDimensions {
  const padding = 30;
  const gridSize = canvasWidth - padding * 2;
  const cellSize = gridSize / (boardSize - 1);
  const stoneRadius = cellSize * 0.45;

  return {
    width: canvasWidth,
    height: canvasWidth,
    gridSize,
    cellSize,
    stoneRadius,
    padding,
  };
}

/**
 * Convert board coordinate to pixel coordinate
 */
export function coordinateToPixel(
  coord: Coordinate,
  dims: BoardDimensions
): { x: number; y: number } {
  const [x, y] = coord;
  return {
    x: dims.padding + x * dims.cellSize,
    y: dims.padding + y * dims.cellSize,
  };
}

/**
 * Convert pixel coordinate to board coordinate
 * Returns null if pixel is outside board or too far from any intersection
 */
export function pixelToCoordinate(
  pixel: { x: number; y: number },
  dims: BoardDimensions
): Coordinate | null {
  const tolerance = dims.cellSize * 0.4;

  // Check bounds with tolerance
  if (
    pixel.x < dims.padding - tolerance ||
    pixel.x > dims.padding + dims.gridSize + tolerance ||
    pixel.y < dims.padding - tolerance ||
    pixel.y > dims.padding + dims.gridSize + tolerance
  ) {
    return null;
  }

  // Calculate nearest grid point
  const x = Math.round((pixel.x - dims.padding) / dims.cellSize);
  const y = Math.round((pixel.y - dims.padding) / dims.cellSize);

  // Clamp to valid range
  const boardSize = Math.round(dims.gridSize / dims.cellSize) + 1;
  const clampedX = Math.max(0, Math.min(boardSize - 1, x));
  const clampedY = Math.max(0, Math.min(boardSize - 1, y));

  // Check if within tolerance of the grid point
  const gridX = dims.padding + clampedX * dims.cellSize;
  const gridY = dims.padding + clampedY * dims.cellSize;
  const distance = Math.sqrt(
    Math.pow(pixel.x - gridX, 2) + Math.pow(pixel.y - gridY, 2)
  );

  if (distance > tolerance) {
    return null;
  }

  return [clampedX, clampedY];
}

/**
 * Get star points (hoshi) for a given board size
 */
export function getStarPoints(boardSize: number): Coordinate[] {
  if (boardSize === 19) {
    return [
      [3, 3], [3, 9], [3, 15],
      [9, 3], [9, 9], [9, 15],
      [15, 3], [15, 9], [15, 15],
    ];
  } else if (boardSize === 13) {
    return [
      [3, 3], [3, 9],
      [6, 6],
      [9, 3], [9, 9],
    ];
  } else if (boardSize === 9) {
    return [
      [2, 2], [2, 6],
      [4, 4],
      [6, 2], [6, 6],
    ];
  }
  return [];
}

/**
 * Draw the board background and grid
 */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  boardSize: number,
  options: {
    backgroundColor?: string;
    lineColor?: string;
    starColor?: string;
  } = {}
): void {
  const {
    backgroundColor = '#C9B896',
    lineColor = '#4A3728',
    starColor = '#3E2723',
  } = options;

  const dims = calculateBoardDimensions(width, boardSize);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;

  for (let i = 0; i < boardSize; i++) {
    const pos = dims.padding + i * dims.cellSize;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(dims.padding, pos);
    ctx.lineTo(dims.padding + dims.gridSize, pos);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(pos, dims.padding);
    ctx.lineTo(pos, dims.padding + dims.gridSize);
    ctx.stroke();
  }

  // Draw star points
  ctx.fillStyle = starColor;
  const starPoints = getStarPoints(boardSize);
  for (const [sx, sy] of starPoints) {
    const { x, y } = coordinateToPixel([sx, sy], dims);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw a stone at the specified pixel coordinates
 */
export function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: StoneColor
): void {
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  if (color === 'black') {
    // Base circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2B2B2B';
    ctx.fill();

    // Reset shadow for gradient
    ctx.shadowColor = 'transparent';

    // Slate highlight (top-left)
    const gradient = ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      0,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, 'rgba(100, 100, 100, 0.6)');
    gradient.addColorStop(0.3, 'rgba(60, 60, 60, 0.3)');
    gradient.addColorStop(1, 'rgba(40, 40, 40, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();
  } else {
    // Base circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#F0F0F0';
    ctx.fill();

    // Reset shadow for gradient
    ctx.shadowColor = 'transparent';

    // Shell highlight (top-left)
    const gradient = ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      0,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(240, 240, 240, 0.5)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fill();

    // Subtle edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draw last move marker
 */
export function drawLastMoveMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: StoneColor
): void {
  ctx.fillStyle = color === 'black' ? 'white' : 'black';
  ctx.fillRect(x - 3, y - 3, 6, 6);
}

/**
 * Draw ghost stone (for hover preview)
 */
export function drawGhostStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: StoneColor
): void {
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color === 'black' ? '#2B2B2B' : '#F0F0F0';
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Draw trial stone (semi-transparent with dashed border for study mode)
 */
export function drawTrialStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: StoneColor
): void {
  // Draw semi-transparent stone
  ctx.globalAlpha = 0.6;

  // Base circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color === 'black' ? '#2B2B2B' : '#F0F0F0';
  ctx.fill();

  // Reset alpha
  ctx.globalAlpha = 1;

  // Draw dashed border to distinguish trial stones
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color === 'black' ? '#666666' : '#999999';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw ko point marker (a square mark indicating the ko point)
 */
export function drawKoMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 8
): void {
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
}

/**
 * Draw coordinate labels (A-T on left/right, 1-19 on top/bottom)
 */
export function drawCoordinates(
  ctx: CanvasRenderingContext2D,
  width: number,
  boardSize: number,
  options: {
    showLeft?: boolean;
    showRight?: boolean;
    showTop?: boolean;
    showBottom?: boolean;
    fontSize?: number;
    fontColor?: string;
  } = {}
): void {
  const {
    showLeft = true,
    showRight = false,
    showTop = false,
    showBottom = true,
    fontSize = 11,
    fontColor = '#4A3728',
  } = options;

  const dims = calculateBoardDimensions(width, boardSize);

  ctx.fillStyle = fontColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Column labels (A-T, skipping I)
  const columns = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

  // Top labels
  if (showTop) {
    for (let i = 0; i < boardSize; i++) {
      const x = dims.padding + i * dims.cellSize;
      const y = dims.padding - 12;
      ctx.fillText(columns[i], x, y);
    }
  }

  // Bottom labels
  if (showBottom) {
    for (let i = 0; i < boardSize; i++) {
      const x = dims.padding + i * dims.cellSize;
      const y = dims.padding + dims.gridSize + 14;
      ctx.fillText(columns[i], x, y);
    }
  }

  // Left labels (1-19 from top to bottom)
  if (showLeft) {
    ctx.textAlign = 'right';
    for (let i = 0; i < boardSize; i++) {
      const y = dims.padding + i * dims.cellSize;
      const x = dims.padding - 8;
      ctx.fillText(String(boardSize - i), x, y);
    }
  }

  // Right labels
  if (showRight) {
    ctx.textAlign = 'left';
    for (let i = 0; i < boardSize; i++) {
      const y = dims.padding + i * dims.cellSize;
      const x = dims.padding + dims.gridSize + 8;
      ctx.fillText(String(boardSize - i), x, y);
    }
  }
}
