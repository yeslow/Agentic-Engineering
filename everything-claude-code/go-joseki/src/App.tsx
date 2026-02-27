import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { KifuPage } from './pages/KifuPage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Circle } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground shrink-0">
              <Circle className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
              <span className="truncate">围棋</span>
            </NavLink>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex gap-1 sm:gap-2">
              <NavLink to="/">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="text-xs sm:text-sm">
                    棋盘
                  </Button>
                )}
              </NavLink>
              <NavLink to="/kifu">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="text-xs sm:text-sm">
                    棋谱
                  </Button>
                )}
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kifu" element={<KifuPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
