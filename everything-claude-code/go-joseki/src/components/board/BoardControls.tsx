import { useBoardStore } from '../../store/boardStore';

export function BoardControls() {
  const { resetBoard, undo, currentColor, board } = useBoardStore();

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm border border-ogs-border">
      <div className="flex items-center justify-between">
        <span className="text-ogs-text font-medium">当前:</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full ${
              currentColor === 'black' ? 'bg-stone-black' : 'bg-stone-white border border-gray-300'
            }`}
          />
          <span className="text-ogs-text">
            {currentColor === 'black' ? '黑棋' : '白棋'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-ogs-muted">
        <span>手数:</span>
        <span>{board.currentMoveNumber}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-ogs-muted">
        <span>提子 (黑):</span>
        <span>{board.captures.black}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-ogs-muted">
        <span>提子 (白):</span>
        <span>{board.captures.white}</span>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={undo}
          disabled={board.moveHistory.length === 0}
          className="flex-1 px-3 py-2 text-sm bg-ogs-accent text-white rounded hover:bg-ogs-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          悔棋
        </button>
        <button
          onClick={resetBoard}
          className="flex-1 px-3 py-2 text-sm bg-gray-200 text-ogs-text rounded hover:bg-gray-300 transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  );
}
