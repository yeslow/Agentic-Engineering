import { useBoardStore } from '../../store/boardStore';
import { useKifuStore } from '../../store/kifuStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Undo2, Trash2, Download, Upload, Play, RotateCcw, Save, GitBranch } from 'lucide-react';
import { exportKifu, importKifuWithPicker } from '../../lib/kifuManager';
import { useState, useMemo } from 'react';

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
    trialStones,
    trialCapturedStones,
  } = useBoardStore();
  const { addKifu, addVariation } = useKifuStore();
  // Subscribe to kifuList reference only
  const kifuList = useKifuStore((state) => state.kifuList);
  // Memoize the latest kifu ID calculation
  const latestKifuId = useMemo(() => {
    if (!kifuList || Object.keys(kifuList).length === 0) return null;
    const sorted = Object.values(kifuList).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0]?.id || null;
  }, [kifuList]);
  const [importError, setImportError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [variationMessage, setVariationMessage] = useState<string | null>(null);

  const handleSave = () => {
    if (board.moveHistory.length === 0) {
      return;
    }

    const defaultName = `棋谱_${board.size}路_${board.moveHistory.length}手`;
    const name = prompt('请输入棋谱名称：', defaultName);

    if (name === null) {
      return; // User cancelled
    }

    const kifuName = name.trim() || defaultName;

    addKifu({
      name: kifuName,
      boardState: board,
      moveCount: board.moveHistory.length,
      size: board.size,
    });

    setSaveMessage('保存成功！');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleExport = () => {
    exportKifu(board);
  };

  const handleImport = async () => {
    try {
      setImportError(null);
      const newBoard = await importKifuWithPicker();
      loadBoard(newBoard);

      // Auto-save imported kifu to list
      const defaultName = `导入棋谱_${newBoard.size}路_${newBoard.moveHistory.length}手`;
      const name = prompt('请输入棋谱名称：', defaultName);

      if (name !== null) {
        const kifuName = name.trim() || defaultName;
        addKifu({
          name: kifuName,
          boardState: newBoard,
          moveCount: newBoard.moveHistory.length,
          size: newBoard.size,
        });
        setSaveMessage('导入并保存成功！');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败';
      setImportError(message);
      console.error('Failed to import kifu:', error);
    }
  };

  const hasTrialStones = trialMoveCount > 0;

  const handleSaveVariation = () => {
    if (!latestKifuId) {
      setVariationMessage('请先保存主棋谱');
      setTimeout(() => setVariationMessage(null), 3000);
      return;
    }

    if (trialStones.black.length === 0 && trialStones.white.length === 0) {
      setVariationMessage('试下模式下没有着手');
      setTimeout(() => setVariationMessage(null), 3000);
      return;
    }

    const defaultName = `变化图_${board.size}路_${trialStones.black.length + trialStones.white.length}手`;
    const name = prompt('请输入变化图名称：', defaultName);

    if (name === null) {
      return;
    }

    const variationName = name.trim() || defaultName;

    // Get trialMoveHistory from board store
    const trialMoveHistory = useBoardStore.getState().trialMoveHistory;

    addVariation({
      name: variationName,
      parentId: latestKifuId,
      boardState: board,
      trialStones,
      trialCapturedStones,
      trialMoveHistory,
      moveCount: trialMoveCount,
    });

    setVariationMessage('变化图保存成功！');
    setTimeout(() => setVariationMessage(null), 3000);
  };

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

        {saveMessage && (
          <Badge variant="default" className="w-full justify-center bg-green-600 hover:bg-green-700">
            {saveMessage}
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
              onClick={handleSaveVariation}
              disabled={!hasTrialStones}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <GitBranch className="h-4 w-4 mr-1" />
              保存变化图
            </Button>
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

        {variationMessage && (
          <Badge variant="default" className="w-full justify-center bg-purple-600 hover:bg-purple-700">
            {variationMessage}
          </Badge>
        )}

        {/* Battle Mode Controls */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={board.moveHistory.length === 0}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
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
        </div>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={resetBoard}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
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
