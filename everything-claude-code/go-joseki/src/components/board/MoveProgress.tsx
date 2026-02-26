import { useBoardStore } from '../../store/boardStore';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play } from 'lucide-react';
import { useEffect } from 'react';

export function MoveProgress() {
  const {
    currentViewMove,
    board,
    goToMove,
    goToPrevious,
    goToNext,
    goToLastMove,
    isViewingMode,
    gameMode,
    exitTrialMode,
  } = useBoardStore();

  const totalMoves = board.moveHistory.length;

  // Get move at current position for display
  const currentMove = currentViewMove > 0 ? board.moveHistory[currentViewMove - 1] : null;

  // Keyboard shortcuts: Left Arrow = previous, Right Arrow = next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (totalMoves === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToMove(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMoves, goToMove, goToPrevious, goToNext, goToLastMove]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                进度 {currentViewMove}/{totalMoves}
              </span>
              <div className="flex items-center gap-2">
                {gameMode === 'trial' && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    试下模式
                  </Badge>
                )}
                {isViewingMode && gameMode !== 'trial' && (
                  <Badge variant="outline">
                    查看中
                  </Badge>
                )}
              </div>
            </div>
            <Slider
              value={[currentViewMove]}
              min={0}
              max={totalMoves}
              step={1}
              onValueChange={(value) => goToMove(value[0])}
              disabled={totalMoves === 0}
              className="w-full"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToMove(0)}
                disabled={currentViewMove === 0 || totalMoves === 0}
                title="跳到开始"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentViewMove === 0 || totalMoves === 0}
                title="后退一手"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Move Display */}
            <div className="flex-1 text-center">
              {currentMove ? (
                <div className="text-sm">
                  <span className="font-medium">
                    第{currentMove.moveNumber}手: {currentMove.color === 'black' ? '黑' : '白'}
                  </span>
                  {currentMove.comment && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentMove.comment}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {totalMoves === 0 ? '未开始' : '初始状态'}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentViewMove >= totalMoves || totalMoves === 0}
                title="前进一手"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToLastMove}
                disabled={currentViewMove >= totalMoves || totalMoves === 0}
                title="跳到最新"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Return to Battle Button (shown in trial mode when viewing past moves) */}
          {gameMode === 'trial' && isViewingMode && (
            <Button
              variant="default"
              size="sm"
              onClick={exitTrialMode}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-1" />
              返回实战模式
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
