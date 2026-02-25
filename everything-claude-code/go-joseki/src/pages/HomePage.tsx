import { GoBoard } from '../components/board/GoBoard';
import { BoardControls } from '../components/board/BoardControls';

export function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Board Section */}
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-ogs-border">
            <GoBoard size={600} className="w-full max-w-[600px] mx-auto" />
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-64">
          <BoardControls />
        </div>
      </div>
    </div>
  );
}
