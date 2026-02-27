import { GoBoard } from '../components/board/GoBoard';
import { BoardControls } from '../components/board/BoardControls';
import { MoveProgress } from '../components/board/MoveProgress';
import { VariationList } from '../components/variation/VariationList';
import { Card, CardContent } from '@/components/ui/card';
import { useKifuStore } from '../store/kifuStore';
import { useBoardStore } from '../store/boardStore';

export function HomePage() {
  const currentKifuId = useKifuStore((state) => state.currentKifuId);
  const board = useBoardStore((state) => state.board);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Board Section */}
        <div className="flex-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <GoBoard size={600} className="w-full max-w-[600px] mx-auto" />
            </CardContent>
          </Card>
          <MoveProgress />
          <VariationList
            parentId={currentKifuId || undefined}
            parentMoveNumber={board.currentMoveNumber}
          />
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-72">
          <BoardControls />
        </div>
      </div>
    </div>
  );
}
