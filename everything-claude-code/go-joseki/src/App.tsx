import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { JosekiPage } from './pages/JosekiPage';

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
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/joseki" element={<JosekiPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
