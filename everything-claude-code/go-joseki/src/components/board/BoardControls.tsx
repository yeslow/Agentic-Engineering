import { useBoardStore } from '../../store/boardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Undo2, Trash2 } from 'lucide-react';

export function BoardControls() {
  const { resetBoard, undo, currentColor, board } = useBoardStore();

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

        <Separator />

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
      </CardContent>
    </Card>
  );
}
