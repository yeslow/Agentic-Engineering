import { GoBoard } from '../components/board/GoBoard';
import { BoardControls } from '../components/board/BoardControls';
import { MoveProgress } from '../components/board/MoveProgress';
import { VariationList } from '../components/variation/VariationList';
import { Card, CardContent } from '@/components/ui/card';
import { useKifuStore } from '../store/kifuStore';
import { useBoardStore } from '../store/boardStore';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function HomePage() {
  const currentKifuId = useKifuStore((state) => state.currentKifuId);
  const board = useBoardStore((state) => state.board);
  const getKifu = useKifuStore((state) => state.getKifu);
  const loadBoard = useBoardStore((state) => state.loadBoard);

  // Calculate optimal board size based on viewport - maximize board space
  const [boardSize, setBoardSize] = useState<number>(660);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Load kifu when page refreshes and currentKifuId exists but board is empty
  useEffect(() => {
    if (currentKifuId && board.moveHistory.length === 0) {
      const kifu = getKifu(currentKifuId);
      if (kifu) {
        loadBoard(kifu.boardState);
      }
    }
  }, [currentKifuId, board.moveHistory.length, getKifu, loadBoard]);

  useEffect(() => {
    const calculateBoardSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const isMobile = viewportWidth < 1024;
      const bottomPadding = 20;

      if (isMobile) {
        // On mobile, use almost full width minus small padding
        const padding = 16;
        const toggleButtonHeight = 50;
        const availableWidth = viewportWidth - padding * 2;
        const availableHeight = viewportHeight - bottomPadding - toggleButtonHeight - 40;
        setBoardSize(Math.floor(Math.min(availableWidth, availableHeight) / 40) * 40);
      } else {
        // Fixed board size for desktop
        setBoardSize(660);
      }
    };

    calculateBoardSize();
    window.addEventListener('resize', calculateBoardSize);
    return () => window.removeEventListener('resize', calculateBoardSize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area - Three Column Layout on Desktop */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* Left Panel - Board Controls */}
        <aside className={cn(
          "fixed inset-0 z-40 lg:z-auto lg:static lg:inset-auto",
          "transform transition-transform duration-300",
          showLeftPanel ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-background lg:bg-transparent"
        )}>
          <div className="h-full w-4/5 max-w-sm lg:w-full lg:max-w-none bg-card lg:bg-transparent border-r lg:border-r-0 shadow-2xl lg:shadow-none overflow-y-auto">
            {/* Mobile handle */}
            <div className="lg:hidden h-8 flex items-center justify-center bg-muted/50">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex flex-col h-full lg:h-screen">
              <div className="p-3 lg:p-4">
                <BoardControls />
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Go Board */}
        <main className="flex-1 flex flex-col items-center justify-start px-2 sm:px-4 py-0 lg:py-0 lg:h-screen">
          <div className="relative flex flex-col items-center justify-start pt-0 lg:pt-4">
            {/* Go Board Card */}
            <Card className={cn(
              "shadow-2xl transition-all duration-300",
              "border-2 border-border/50 bg-[#C9B896]/10"
            )}>
              <CardContent className="p-1 sm:p-3">
                <div className="flex justify-center">
                  <GoBoard size={boardSize} className="w-full h-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Mobile Toggle Buttons */}
            <div className="lg:hidden flex items-center justify-center gap-3 mt-3">
              <button
                onClick={() => {
                  setShowLeftPanel(!showLeftPanel);
                  setShowRightPanel(false);
                }}
                className="px-3 py-1.5 bg-card border rounded-md text-xs font-medium hover:bg-card/80 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  控制
                </span>
              </button>
              <button
                onClick={() => {
                  setShowRightPanel(!showRightPanel);
                  setShowLeftPanel(false);
                }}
                className="px-3 py-1.5 bg-card border rounded-md text-xs font-medium hover:bg-card/80 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  变化图
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Panel - Progress & Variations */}
        <aside className={cn(
          "fixed inset-0 z-40 lg:z-auto lg:static lg:inset-auto",
          "transform transition-transform duration-300",
          showRightPanel ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "bg-background lg:bg-transparent"
        )}>
          <div className="h-full w-4/5 max-w-sm lg:w-80 lg:max-w-none bg-card lg:bg-transparent border-l lg:border-l-0 shadow-2xl lg:shadow-none overflow-y-auto">
            {/* Mobile handle */}
            <div className="lg:hidden h-8 flex items-center justify-center bg-muted/50">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex flex-col h-full lg:h-screen">
              <div className="p-3 lg:p-4 space-y-4">
                {/* Progress Section */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">进度</h3>
                  <MoveProgress compact={boardSize < 450} />
                </div>

                {/* Variations Section */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1 flex items-center gap-2">
                    变化图
                    {currentKifuId && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {useKifuStore.getState().variations ? Object.values(useKifuStore.getState().variations).filter(v => v.parentId === currentKifuId).length : 0}
                      </span>
                    )}
                  </h3>
                  <Card className="bg-card/50">
                    <CardContent className="p-2">
                      <VariationList
                        parentId={currentKifuId || undefined}
                        parentMoveNumber={board.currentMoveNumber}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Backdrop for mobile panels */}
      {(showLeftPanel || showRightPanel) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => {
            setShowLeftPanel(false);
            setShowRightPanel(false);
          }}
        />
      )}
    </div>
  );
}
