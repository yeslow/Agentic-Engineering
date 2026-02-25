import { useEffect, useRef } from 'react';
import { useJosekiStore } from '../../store/josekiStore';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  drawBoard,
  drawStone,
  drawLastMoveMarker,
} from '../../lib/boardRenderer';

export function JosekiViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    selectedJoseki,
    currentMoveNumber,
    clearSelection,
    nextMove,
    prevMove,
    resetPosition,
    goToMove,
  } = useJosekiStore();

  const size = 500;

  // Draw the board with current position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedJoseki) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw board background and grid
    drawBoard(ctx, size, size, selectedJoseki.boardSize);

    // Draw stones up to current move
    const dims = calculateBoardDimensions(size, selectedJoseki.boardSize);

    // Draw initial position
    if (selectedJoseki.initialPosition) {
      for (const [bx, by] of selectedJoseki.initialPosition.black) {
        const { x, y } = coordinateToPixel([bx, by], dims);
        drawStone(ctx, x, y, dims.stoneRadius, 'black');
      }
      for (const [wx, wy] of selectedJoseki.initialPosition.white) {
        const { x, y } = coordinateToPixel([wx, wy], dims);
        drawStone(ctx, x, y, dims.stoneRadius, 'white');
      }
    }

    // Draw moves up to current move number
    for (let i = 0; i < currentMoveNumber && i < selectedJoseki.mainLine.length; i++) {
      const move = selectedJoseki.mainLine[i];
      const { x, y } = coordinateToPixel(move.coordinate, dims);
      drawStone(ctx, x, y, dims.stoneRadius, move.color);

      // Mark last move
      if (i === currentMoveNumber - 1) {
        drawLastMoveMarker(ctx, x, y, move.color);
      }
    }
  }, [selectedJoseki, currentMoveNumber, size]);

  if (!selectedJoseki) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-8 text-center">
        <p className="text-ogs-muted">请选择一个定式查看详情</p>
      </div>
    );
  }

  const currentMove = currentMoveNumber > 0
    ? selectedJoseki.mainLine[currentMoveNumber - 1]
    : null;

  const progress = selectedJoseki.mainLine.length > 0
    ? (currentMoveNumber / selectedJoseki.mainLine.length) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-ogs-text">{selectedJoseki.name}</h2>
          {selectedJoseki.japaneseName && (
            <p className="text-sm text-ogs-muted">{selectedJoseki.japaneseName}</p>
          )}
        </div>
        <button
          onClick={clearSelection}
          className="px-3 py-1 text-sm bg-gray-100 text-ogs-text rounded hover:bg-gray-200"
        >
          返回列表
        </button>
      </div>

      {/* Board and Info */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Board */}
        <div className="flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded border border-ogs-border"
          />
        </div>

        {/* Info Panel */}
        <div className="flex-1 space-y-4">
          {/* Move Controls */}
          <div className="bg-ogs-bg rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ogs-text">
                手数: {currentMoveNumber} / {selectedJoseki.mainLine.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={resetPosition}
                  disabled={currentMoveNumber === 0}
                  className="px-3 py-1 text-sm bg-white border border-ogs-border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  开局
                </button>
                <button
                  onClick={prevMove}
                  disabled={currentMoveNumber === 0}
                  className="px-3 py-1 text-sm bg-white border border-ogs-border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  ← 上一手
                </button>
                <button
                  onClick={nextMove}
                  disabled={currentMoveNumber >= selectedJoseki.mainLine.length}
                  className="px-3 py-1 text-sm bg-ogs-accent text-white rounded hover:bg-ogs-accent/90 disabled:opacity-50"
                >
                  下一手 →
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-ogs-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Move Slider */}
            <input
              type="range"
              min={0}
              max={selectedJoseki.mainLine.length}
              value={currentMoveNumber}
              onChange={(e) => goToMove(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          {/* Current Move Comment */}
          {currentMove?.comment && (
            <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>第 {currentMoveNumber} 手 ({currentMove.color === 'black' ? '黑' : '白'}):</strong>{' '}
                {currentMove.comment}
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h3 className="font-medium text-ogs-text mb-2">定式解说</h3>
            <p className="text-sm text-ogs-muted leading-relaxed">
              {selectedJoseki.explanation}
            </p>
          </div>

          {/* Key Points */}
          <div>
            <h3 className="font-medium text-ogs-text mb-2">要点</h3>
            <ul className="list-disc list-inside text-sm text-ogs-muted space-y-1">
              {selectedJoseki.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedJoseki.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-ogs-bg text-ogs-muted rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
