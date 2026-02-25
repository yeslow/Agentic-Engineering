import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { JosekiPage } from './pages/JosekiPage';
import { PracticePage } from './pages/PracticePage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ogs-bg">
        {/* Navigation */}
        <nav className="bg-white border-b border-ogs-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link to="/" className="text-lg font-bold text-ogs-text">
              围棋定式学习
            </Link>
            <div className="flex gap-4">
              <Link
                to="/"
                className="text-ogs-muted hover:text-ogs-accent transition-colors"
              >
                棋盘
              </Link>
              <Link
                to="/joseki"
                className="text-ogs-muted hover:text-ogs-accent transition-colors"
              >
                定式库
              </Link>
              <Link
                to="/practice"
                className="text-ogs-muted hover:text-ogs-accent transition-colors"
              >
                练习
              </Link>
              <Link
                to="/quiz"
                className="text-ogs-muted hover:text-ogs-accent transition-colors"
              >
                测验
              </Link>
              <Link
                to="/dashboard"
                className="text-ogs-muted hover:text-ogs-accent transition-colors"
              >
                进度
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/joseki" element={<JosekiPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
