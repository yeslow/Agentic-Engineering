import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '../../store/boardStore';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  pixelToCoordinate,
  drawBoard,
  drawStone,
  drawLastMoveMarker,
  drawGhostStone,
} from '../../lib/boardRenderer';
// Coordinate type is used via store

interface GoBoardProps {
  size?: number;
  className?: string;
}

export function GoBoard({ size = 600, className = '' }: GoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    board,
    currentColor,
    hoverCoord,
    playMove,
    setHoverCoord,
  } = useBoardStore();

  // Draw the board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw board background and grid
    drawBoard(ctx, size, size, board.size);

    // Draw stones
    const dims = calculateBoardDimensions(size, board.size);

    // Draw black stones
    for (const coord of board.stones.black) {
      const { x, y } = coordinateToPixel(coord, dims);
      drawStone(ctx, x, y, dims.stoneRadius, 'black');
    }

    // Draw white stones
    for (const coord of board.stones.white) {
      const { x, y } = coordinateToPixel(coord, dims);
      drawStone(ctx, x, y, dims.stoneRadius, 'white');
    }

    // Draw last move marker
    if (board.lastMove) {
      const { x, y } = coordinateToPixel(board.lastMove, dims);
      const lastMoveColor = board.stones.black.some(
        ([bx, by]) => bx === board.lastMove![0] && by === board.lastMove![1]
      )
        ? 'black'
        : 'white';
      drawLastMoveMarker(ctx, x, y, lastMoveColor);
    }

    // Draw hover ghost stone
    if (hoverCoord) {
      const { x, y } = coordinateToPixel(hoverCoord, dims);
      drawGhostStone(ctx, x, y, dims.stoneRadius, currentColor);
    }
  }, [board, hoverCoord, currentColor, size]);

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dims = calculateBoardDimensions(size, board.size);
      const coord = pixelToCoordinate({ x, y }, dims);

      if (coord) {
        playMove(coord);
      }
    },
    [board.size, playMove, size]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dims = calculateBoardDimensions(size, board.size);
      const coord = pixelToCoordinate({ x, y }, dims);

      setHoverCoord(coord);
    },
    [board.size, setHoverCoord, size]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoverCoord(null);
  }, [setHoverCoord]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

export default GoBoard;
