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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { Coordinate } from '../../types/go';
import { Lightbulb, ArrowLeft, CheckCircle, BookOpen, AlertCircle, RotateCcw } from 'lucide-react';

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

  const handleRestart = () => {
    if (!selectedJoseki) return;
    const newSession = createPracticeSession(selectedJoseki);
    setSession(newSession);
    setMessage('请按照定式顺序下棋');
    setIsComplete(false);
  };

  if (!selectedJoseki) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-bold mb-2">请选择要练习的定式</h2>
        <p className="text-muted-foreground mb-4">前往定式库选择一个定式开始练习</p>
        <Button asChild>
          <a href="/joseki">去定式库</a>
        </Button>
      </Card>
    );
  }

  if (!session) return null;

  const accuracy = calculateAccuracy(session, selectedJoseki);
  const progress = (session.currentMoveIndex / selectedJoseki.mainLine.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>练习模式: {selectedJoseki.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            {isComplete && (
              <Button variant="outline" size="sm" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重新开始
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={clearSelection}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverCoord(null)}
              className={`rounded-lg border ${isComplete ? 'cursor-default' : 'cursor-pointer'}`}
            />
          </div>

          <div className="flex-1 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    进度: {session.currentMoveIndex} / {selectedJoseki.mainLine.length}
                  </span>
                  <Badge variant="secondary">正确率: {accuracy}%</Badge>
                </div>
                <Progress value={progress} />
              </CardContent>
            </Card>

            <Alert variant={isComplete ? "default" : "destructive"} className={isComplete ? "border-green-500/50 bg-green-500/10" : ""}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            {isComplete && (
              <Card className="border-green-500/50 bg-green-500/10">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="text-lg font-bold text-green-700 mb-2">恭喜完成！</h3>
                  <p className="text-sm text-green-600">
                    最终正确率: {accuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    使用提示: {session.hintsUsed} 次 | 错误: {session.mistakes} 次
                  </p>
                </CardContent>
              </Card>
            )}

            {!isComplete && (
              <Button
                variant="secondary"
                onClick={handleHint}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                提示
              </Button>
            )}

            <Separator />

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                要点
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {selectedJoseki.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
