import { useState, useEffect, useRef } from 'react';
import { useJosekiStore } from '../../store/josekiStore';
import { useProgressStore } from '../../store/progressStore';
import {
  createPracticeSession,
  checkUserMove,
  getHint,
  calculateAccuracy,
  type PracticeSession,
} from '../../lib/practiceEngine';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  pixelToCoordinate,
  drawBoard,
  drawStone,
  drawGhostStone,
} from '../../lib/boardRenderer';
import type { Coordinate } from '../../types/go';

export function PracticeMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedJoseki, clearSelection } = useJosekiStore();
  const { recordPractice } = useProgressStore();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<Coordinate | null>(null);

  const size = 500;

  // Initialize session
  useEffect(() => {
    if (selectedJoseki) {
      const newSession = createPracticeSession(selectedJoseki);
      setSession(newSession);
      setMessage('请按照定式顺序下棋');
      setIsComplete(false);
    }
  }, [selectedJoseki]);

  // Draw board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedJoseki || !session) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBoard(ctx, size, size, selectedJoseki.boardSize);

    const dims = calculateBoardDimensions(size, selectedJoseki.boardSize);

    // Draw all moves up to current
    for (let i = 0; i < session.currentMoveIndex && i < selectedJoseki.mainLine.length; i++) {
      const move = selectedJoseki.mainLine[i];
      const { x, y } = coordinateToPixel(move.coordinate, dims);
      drawStone(ctx, x, y, dims.stoneRadius, move.color);
    }

    // Draw hover ghost
    if (hoverCoord && !isComplete) {
      const currentMove = selectedJoseki.mainLine[session.currentMoveIndex];
      if (currentMove) {
        const { x, y } = coordinateToPixel(hoverCoord, dims);
        drawGhostStone(ctx, x, y, dims.stoneRadius, currentMove.color);
      }
    }
  }, [selectedJoseki, session, hoverCoord, isComplete, size]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!session || !selectedJoseki || isComplete) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dims = calculateBoardDimensions(size, selectedJoseki.boardSize);
    const coord = pixelToCoordinate({ x, y }, dims);

    if (!coord) return;

    // Check the move
    const result = checkUserMove(session, selectedJoseki, coord);

    if (result.isCorrect) {
      setMessage(result.message || '正确！');

      if (session.isComplete) {
        setIsComplete(true);
        const accuracy = calculateAccuracy(session, selectedJoseki);
        recordPractice(selectedJoseki.id, accuracy);
      }
    } else {
      setMessage(result.message || '不正确，请重试');
    }

    // Force re-render
    setSession({ ...session });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedJoseki) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dims = calculateBoardDimensions(size, selectedJoseki.boardSize);
    const coord = pixelToCoordinate({ x, y }, dims);
    setHoverCoord(coord);
  };

  const handleHint = () => {
    if (!session || !selectedJoseki) return;

    const hint = getHint(session, selectedJoseki);
    if (hint) {
      setMessage(`提示: ${hint.message}`);
      setSession({ ...session });
    }
  };

  if (!selectedJoseki || !session) return null;

  const accuracy = calculateAccuracy(session, selectedJoseki);
  const progress = (session.currentMoveIndex / selectedJoseki.mainLine.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-ogs-text">练习模式: {selectedJoseki.name}</h2>
        <button
          onClick={clearSelection}
          className="px-3 py-1 text-sm bg-gray-100 text-ogs-text rounded hover:bg-gray-200"
        >
          返回
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverCoord(null)}
            className={`rounded border border-ogs-border ${isComplete ? 'cursor-default' : 'cursor-pointer'}`}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-ogs-bg rounded p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-ogs-text">
                进度: {session.currentMoveIndex} / {selectedJoseki.mainLine.length}
              </span>
              <span className="text-sm text-ogs-muted">
                正确率: {accuracy}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-ogs-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className={`p-3 rounded ${isComplete ? 'bg-green-50 border-l-4 border-green-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
            <p className="text-sm text-ogs-text">{message}</p>
          </div>

          {isComplete && (
            <div className="bg-green-50 rounded p-4 text-center">
              <h3 className="text-lg font-bold text-green-700 mb-2">🎉 恭喜完成！</h3>
              <p className="text-sm text-green-600">
                最终正确率: {accuracy}%
              </p>
              <p className="text-xs text-ogs-muted mt-1">
                使用提示: {session.hintsUsed} 次 | 错误: {session.mistakes} 次
              </p>
            </div>
          )}

          {!isComplete && (
            <div className="flex gap-2">
              <button
                onClick={handleHint}
                className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                💡 提示
              </button>
            </div>
          )}

          <div>
            <h3 className="font-medium text-ogs-text mb-2">要点</h3>
            <ul className="list-disc list-inside text-sm text-ogs-muted space-y-1">
              {selectedJoseki.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
