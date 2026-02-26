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
  drawTrialStone,
  drawKoMarker,
  drawCoordinates,
} from '../../lib/boardRenderer';
import type { Coordinate } from '../../types/go';

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
    playTrialMove,
    setHoverCoord,
    gameMode,
    trialStones,
    trialMoveCount,
    trialCapturedStones,
  } = useBoardStore();

  // Determine the color for trial move (based on current board state + trial moves)
  const getTrialColor = useCallback(() => {
    // Use board.currentMoveNumber to handle viewing mode correctly
    const boardMoveCount = board.currentMoveNumber;
    const totalMoveCount = boardMoveCount + trialMoveCount;
    return totalMoveCount % 2 === 0 ? 'black' : 'white';
  }, [board.currentMoveNumber, trialMoveCount]);

  // Check if a coordinate is occupied by board stones or trial stones
  const isOccupied = useCallback(
    (coord: Coordinate) => {
      // Check if captured in trial mode
      const isTrialCaptured =
        trialCapturedStones.black.some(([x, y]) => x === coord[0] && y === coord[1]) ||
        trialCapturedStones.white.some(([x, y]) => x === coord[0] && y === coord[1]);
      if (isTrialCaptured) {
        return false; // Captured stones are not considered occupied
      }

      const isBoardOccupied =
        board.stones.black.some(([x, y]) => x === coord[0] && y === coord[1]) ||
        board.stones.white.some(([x, y]) => x === coord[0] && y === coord[1]);
      const isTrialOccupied =
        trialStones.black.some(([x, y]) => x === coord[0] && y === coord[1]) ||
        trialStones.white.some(([x, y]) => x === coord[0] && y === coord[1]);
      return isBoardOccupied || isTrialOccupied;
    },
    [board.stones, trialStones, trialCapturedStones]
  );

  // Draw the board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw board background and grid
    drawBoard(ctx, size, size, board.size);

    // Draw coordinates
    drawCoordinates(ctx, size, board.size);

    // Draw stones
    const dims = calculateBoardDimensions(size, board.size);

    // Helper to check if a black stone is captured in trial mode (captured by white)
    const isBlackCapturedInTrial = (coord: Coordinate) =>
      trialCapturedStones.white.some(([x, y]) => x === coord[0] && y === coord[1]);

    // Helper to check if a white stone is captured in trial mode (captured by black)
    const isWhiteCapturedInTrial = (coord: Coordinate) =>
      trialCapturedStones.black.some(([x, y]) => x === coord[0] && y === coord[1]);

    // Draw black stones (filter out captured stones)
    for (const coord of board.stones.black) {
      if (isBlackCapturedInTrial(coord)) continue;
      const { x, y } = coordinateToPixel(coord, dims);
      drawStone(ctx, x, y, dims.stoneRadius, 'black');
    }

    // Draw white stones (filter out captured stones)
    for (const coord of board.stones.white) {
      if (isWhiteCapturedInTrial(coord)) continue;
      const { x, y } = coordinateToPixel(coord, dims);
      drawStone(ctx, x, y, dims.stoneRadius, 'white');
    }

    // Draw last move marker (only for main board stones, and not if captured)
    const isLastMoveCaptured =
      (board.stones.black.some(([bx, by]) => bx === board.lastMove![0] && by === board.lastMove![1]) &&
        isBlackCapturedInTrial(board.lastMove!)) ||
      (board.stones.white.some(([wx, wy]) => wx === board.lastMove![0] && wy === board.lastMove![1]) &&
        isWhiteCapturedInTrial(board.lastMove!));

    if (board.lastMove && !isLastMoveCaptured) {
      const { x, y } = coordinateToPixel(board.lastMove, dims);
      const lastMoveColor = board.stones.black.some(
        ([bx, by]) => bx === board.lastMove![0] && by === board.lastMove![1]
      )
        ? 'black'
        : 'white';
      drawLastMoveMarker(ctx, x, y, lastMoveColor);
    }

    // Draw trial stones (semi-transparent with dashed border)
    // Filter out captured trial stones
    for (const coord of trialStones.black) {
      // Skip if this trial stone was captured by white
      if (trialCapturedStones.white.some(([x, y]) => x === coord[0] && y === coord[1])) continue;
      const { x, y } = coordinateToPixel(coord, dims);
      drawTrialStone(ctx, x, y, dims.stoneRadius, 'black');
    }
    for (const coord of trialStones.white) {
      // Skip if this trial stone was captured by black
      if (trialCapturedStones.black.some(([x, y]) => x === coord[0] && y === coord[1])) continue;
      const { x, y } = coordinateToPixel(coord, dims);
      drawTrialStone(ctx, x, y, dims.stoneRadius, 'white');
    }

    // Draw hover ghost stone (only if not occupied)
    if (hoverCoord && !isOccupied(hoverCoord)) {
      const { x, y } = coordinateToPixel(hoverCoord, dims);
      // In trial mode, show color based on trial move count
      const hoverColor = gameMode === 'trial' ? getTrialColor() : currentColor;
      drawGhostStone(ctx, x, y, dims.stoneRadius, hoverColor);
    }

    // Draw ko point marker
    if (board.koPoint) {
      const { x, y } = coordinateToPixel(board.koPoint, dims);
      drawKoMarker(ctx, x, y);
    }
  }, [
    board,
    hoverCoord,
    currentColor,
    size,
    gameMode,
    trialStones,
    trialMoveCount,
    trialCapturedStones,
    isOccupied,
    getTrialColor,
  ]);

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
        if (gameMode === 'trial') {
          // In trial mode, play trial move
          playTrialMove(coord);
        } else {
          // In battle mode, play normal move
          playMove(coord);
        }
      }
    },
    [board.size, playMove, playTrialMove, size, gameMode]
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
