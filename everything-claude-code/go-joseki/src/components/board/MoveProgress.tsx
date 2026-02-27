import { useBoardStore } from '../../store/boardStore';
import { useKifuStore } from '../../store/kifuStore';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MoveProgressProps {
  compact?: boolean;
}

export function MoveProgress({ compact = false }: MoveProgressProps) {
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
    getTotalMoves,
    trialRedoStack,
    redoTrialMove,
  } = useBoardStore();
  const { setCurrentVariationId, currentKifuId, getKifu } = useKifuStore();

  // Get the saved move count from current kifu (if any)
  const savedMoveCount = useMemo(() => {
    if (!currentKifuId) return 0;
    const kifu = getKifu(currentKifuId);
    return kifu?.moveCount || 0;
  }, [currentKifuId, getKifu]);

  // Determine if we are at the latest move (not viewing history)
  // If at latest move, going back should truncate (delete the move)
  // If viewing history, going back just navigates without truncating
  const isAtLatestMove = currentViewMove >= board.moveHistory.length;

  // Calculate the minimum allowed position for truncation
  // Cannot truncate below savedMoveCount (to preserve saved history)
  const minTruncateIndex = savedMoveCount;

  // Calculate total moves and current position
  const totalMoves = getTotalMoves();
  const currentMoveIndex = currentViewMove;

  // Helper to determine if we should truncate when going to a target index
  // Only truncate if:
  // 1. We are at the latest move (have been playing new moves)
  // 2. Target is before current position
  // 3. Target is at or above the saved move count (don't truncate saved history)
  const shouldTruncateTo = (targetIndex: number) => {
    return isAtLatestMove && targetIndex < currentMoveIndex && targetIndex >= minTruncateIndex;
  };

  // Get move at current position for display
  const currentMove = useMemo(() => {
    return currentViewMove > 0 ? board.moveHistory[currentViewMove - 1] : null;
  }, [currentViewMove, board.moveHistory]);

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
        // Truncate if going to a valid truncate position
        const targetIndex = Math.max(0, currentMoveIndex - 1);
        goToPrevious(shouldTruncateTo(targetIndex));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (gameMode === 'trial') {
          // In trial mode, right arrow redos trial moves
          redoTrialMove();
        } else {
          goToNext();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        // Truncate if going to a valid truncate position (not below saved count)
        goToMove(0, shouldTruncateTo(0));
      } else if (e.key === 'End') {
        e.preventDefault();
        goToLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMoves, gameMode, goToMove, goToPrevious, goToNext, goToLastMove, redoTrialMove, isAtLatestMove, currentMoveIndex, minTruncateIndex]);

  return (
    <Card className={compact ? 'shadow-lg' : 'shadow-xl'}>
      <CardContent className={cn("pt-3 sm:pt-4", compact && 'py-2 sm:py-3')}>
        <div className={cn("space-y-3 sm:space-y-4", compact && 'space-y-2 sm:space-y-3')}>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                进度 {currentMoveIndex}/{totalMoves}
              </span>
              <div className="flex items-center gap-2">
                {gameMode === 'trial' && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-600 hover:bg-amber-700 text-xs"
                  >
                    试下模式
                  </Badge>
                )}
                {isViewingMode && gameMode !== 'trial' && (
                  <Badge variant="outline" className="text-xs">
                    查看中
                  </Badge>
                )}
              </div>
            </div>
            <Slider
              value={[currentMoveIndex]}
              min={0}
              max={totalMoves}
              step={1}
              onValueChange={(value) => {
                // Truncate only if going to a valid position (not below saved count)
                const targetIndex = value[0];
                goToMove(targetIndex, shouldTruncateTo(targetIndex));
              }}
              disabled={totalMoves === 0}
              className="w-full"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={() => goToMove(0, shouldTruncateTo(0))}
                disabled={currentMoveIndex === 0 || totalMoves === 0}
                title="跳到开始"
                className={cn("h-7 w-7 sm:h-8 sm:w-8", compact && 'h-6 w-6 sm:h-7 sm:w-7')}
              >
                <ChevronsLeft className={cn("h-3 w-3 sm:h-4 sm:w-4", compact && 'h-2.5 w-2.5 sm:h-3 sm:w-3')} />
              </Button>
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={() => {
                  const targetIndex = Math.max(0, currentMoveIndex - 1);
                  goToPrevious(shouldTruncateTo(targetIndex));
                }}
                disabled={currentMoveIndex === 0 || totalMoves === 0}
                title="后退一手"
                className={cn("h-7 w-7 sm:h-8 sm:w-8", compact && 'h-6 w-6 sm:h-7 sm:w-7')}
              >
                <ChevronLeft className={cn("h-3 w-3 sm:h-4 sm:w-4", compact && 'h-2.5 w-2.5 sm:h-3 sm:w-3')} />
              </Button>
            </div>

            {/* Current Move Display */}
            <div className="flex-1 text-center px-2">
              {currentMove ? (
                <div className={cn("font-medium", compact ? 'text-xs' : 'text-xs sm:text-sm')}>
                  <span>
                    第{currentMove.moveNumber}手：{currentMove.color === 'black' ? '黑' : '白'}
                  </span>
                  {currentMove.comment && (
                    <div className={cn("text-muted-foreground mt-0.5 truncate", compact ? 'text-[10px]' : 'text-xs')}>
                      {currentMove.comment}
                    </div>
                  )}
                </div>
              ) : (
                <div className={cn("text-muted-foreground", compact ? 'text-xs' : 'text-xs sm:text-sm')}>
                  {totalMoves === 0 ? '未开始' : '初始状态'}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={() => {
                  if (gameMode === 'trial') {
                    redoTrialMove();
                  } else {
                    goToNext();
                  }
                }}
                disabled={gameMode === 'trial' ? trialRedoStack.length === 0 : currentMoveIndex >= totalMoves || totalMoves === 0}
                title="前进一手"
                className={cn("h-7 w-7 sm:h-8 sm:w-8", compact && 'h-6 w-6 sm:h-7 sm:w-7')}
              >
                <ChevronRight className={cn("h-3 w-3 sm:h-4 sm:w-4", compact && 'h-2.5 w-2.5 sm:h-3 sm:w-3')} />
              </Button>
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={goToLastMove}
                disabled={currentMoveIndex >= totalMoves || totalMoves === 0}
                title="跳到最新"
                className={cn("h-7 w-7 sm:h-8 sm:w-8", compact && 'h-6 w-6 sm:h-7 sm:w-7')}
              >
                <ChevronsRight className={cn("h-3 w-3 sm:h-4 sm:w-4", compact && 'h-2.5 w-2.5 sm:h-3 sm:w-3')} />
              </Button>
            </div>
          </div>

          {/* Return to Battle Button (shown in trial mode) */}
          {gameMode === 'trial' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                exitTrialMode();
                setCurrentVariationId(null);
              }}
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
