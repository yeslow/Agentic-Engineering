import { useBoardStore } from '../../store/boardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Undo2, Trash2, Download, Upload, Play, RotateCcw } from 'lucide-react';
import { exportKifu, importKifuWithPicker } from '../../lib/kifuManager';
import { useState } from 'react';

export function BoardControls() {
  const {
    resetBoard,
    undo,
    currentColor,
    board,
    loadBoard,
    gameMode,
    trialMoveCount,
    exitTrialMode,
    undoTrialMove,
    clearTrialStones,
  } = useBoardStore();
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    exportKifu(board);
  };

  const handleImport = async () => {
    try {
      setImportError(null);
      const newBoard = await importKifuWithPicker();
      loadBoard(newBoard);
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败';
      setImportError(message);
      console.error('Failed to import kifu:', error);
    }
  };

  const hasTrialStones = trialMoveCount > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>棋盘控制</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full border border-border ${
                currentColor === 'black' ? 'bg-stone-black' : 'bg-stone-white'
              }`}
            />
            <span className="text-sm font-normal text-muted-foreground">
              {currentColor === 'black' ? '黑棋' : '白棋'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Mode Indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">模式</span>
          <Badge
            variant={gameMode === 'battle' ? 'default' : 'secondary'}
            className={gameMode === 'trial' ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {gameMode === 'battle' ? '对战' : '试下'}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">手数</span>
          <Badge variant="secondary">{board.currentMoveNumber}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">提子 (黑)</span>
          <Badge variant="secondary">{board.captures.black}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">提子 (白)</span>
          <Badge variant="secondary">{board.captures.white}</Badge>
        </div>

        {importError && (
          <Badge variant="destructive" className="w-full justify-center">
            {importError}
          </Badge>
        )}

        <Separator />

        {/* Trial Mode Controls */}
        {gameMode === 'trial' && (
          <>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              试下模式：落子不会保存到棋谱
              {hasTrialStones && (
                <span className="block mt-1">
                  已下 {trialMoveCount} 手试下棋子
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undoTrialMove}
                disabled={!hasTrialStones}
                className="flex-1"
              >
                <Undo2 className="h-4 w-4 mr-1" />
                撤销试下
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTrialStones}
                disabled={!hasTrialStones}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                清除试下
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={exitTrialMode}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-1" />
              返回实战
            </Button>
            <Separator />
          </>
        )}

        {/* Battle Mode Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={board.moveHistory.length === 0}
            className="flex-1"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            悔棋
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={resetBoard}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={board.moveHistory.length === 0}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            导入
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
