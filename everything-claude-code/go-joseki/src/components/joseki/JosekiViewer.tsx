import { useEffect, useRef } from 'react';
import { useJosekiStore } from '../../store/josekiStore';
import {
  calculateBoardDimensions,
  coordinateToPixel,
  drawBoard,
  drawStone,
  drawLastMoveMarker,
  drawCoordinates,
} from '../../lib/boardRenderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, SkipBack, ArrowLeft } from 'lucide-react';

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

    // Draw coordinates
    drawCoordinates(ctx, size, selectedJoseki.boardSize);

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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">请选择一个定式查看详情</p>
      </Card>
    );
  }

  const currentMove = currentMoveNumber > 0
    ? selectedJoseki.mainLine[currentMoveNumber - 1]
    : null;

  const progress = selectedJoseki.mainLine.length > 0
    ? (currentMoveNumber / selectedJoseki.mainLine.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{selectedJoseki.name}</CardTitle>
            {selectedJoseki.japaneseName && (
              <CardDescription>{selectedJoseki.japaneseName}</CardDescription>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Board */}
          <div className="flex-shrink-0">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              className="rounded-lg border"
            />
          </div>

          {/* Info Panel */}
          <div className="flex-1 space-y-4">
            {/* Move Controls */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    手数: {currentMoveNumber} / {selectedJoseki.mainLine.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetPosition}
                      disabled={currentMoveNumber === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevMove}
                      disabled={currentMoveNumber === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={nextMove}
                      disabled={currentMoveNumber >= selectedJoseki.mainLine.length}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Progress value={progress} />

                <Slider
                  value={[currentMoveNumber]}
                  min={0}
                  max={selectedJoseki.mainLine.length}
                  step={1}
                  onValueChange={([value]) => goToMove(value)}
                />
              </CardContent>
            </Card>

            {/* Current Move Comment */}
            {currentMove?.comment && (
              <div className="bg-primary/10 rounded-lg p-3 border-l-4 border-primary">
                <p className="text-sm">
                  <strong>第 {currentMoveNumber} 手 ({currentMove.color === 'black' ? '黑' : '白'}):</strong>{' '}
                  {currentMove.comment}
                </p>
              </div>
            )}

            <Separator />

            {/* Explanation */}
            <div>
              <h3 className="font-medium mb-2">定式解说</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedJoseki.explanation}
              </p>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="font-medium mb-2">要点</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {selectedJoseki.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedJoseki.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
