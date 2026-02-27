import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { JosekiPage } from './pages/JosekiPage';
import { PracticePage } from './pages/PracticePage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { KifuPage } from './pages/KifuPage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Circle, Library } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Circle className="h-5 w-5 fill-primary text-primary" />
              围棋定式学习
            </NavLink>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex gap-2">
              <NavLink to="/">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    棋盘
                  </Button>
                )}
              </NavLink>
              <NavLink to="/joseki">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    定式库
                  </Button>
                )}
              </NavLink>
              <NavLink to="/kifu">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    <Library className="h-4 w-4 mr-1" />
                    棋谱
                  </Button>
                )}
              </NavLink>
              <NavLink to="/practice">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    练习
                  </Button>
                )}
              </NavLink>
              <NavLink to="/quiz">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    测验
                  </Button>
                )}
              </NavLink>
              <NavLink to="/dashboard">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="sm">
                    进度
                  </Button>
                )}
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/joseki" element={<JosekiPage />} />
          <Route path="/kifu" element={<KifuPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
