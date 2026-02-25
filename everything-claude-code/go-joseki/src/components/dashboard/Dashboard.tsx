import { useProgressStore } from '../../store/progressStore';
import { josekiDatabase } from '../../data/joseki';

export function Dashboard() {
  const { getStats, progress, exportData, importData } = useProgressStore();
  const stats = getStats(josekiDatabase.length);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `go-joseki-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (importData(json)) {
        alert('导入成功！');
      } else {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-ogs-text">学习进度</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="已掌握"
          value={stats.masteredCount}
          total={stats.totalJoseki}
          color="green"
        />
        <StatCard
          title="学习中"
          value={stats.learningCount}
          total={stats.totalJoseki}
          color="blue"
        />
        <StatCard
          title="未开始"
          value={stats.notStartedCount}
          total={stats.totalJoseki}
          color="gray"
        />
        <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4 text-center">
          <p className="text-sm text-ogs-muted">平均正确率</p>
          <p className={`text-2xl font-bold ${stats.averageAccuracy >= 80 ? 'text-green-500' : stats.averageAccuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {stats.averageAccuracy}%
          </p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
        <h2 className="text-lg font-bold text-ogs-text mb-4">学习统计</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-ogs-muted">练习次数</p>
            <p className="text-xl font-bold text-ogs-text">{stats.totalPracticeSessions}</p>
          </div>
          <div>
            <p className="text-sm text-ogs-muted">测验次数</p>
            <p className="text-xl font-bold text-ogs-text">{stats.totalQuizzes}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
        <h2 className="text-lg font-bold text-ogs-text mb-4">最近学习</h2>
        <RecentActivityList progress={progress} />
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm border border-ogs-border p-4">
        <h2 className="text-lg font-bold text-ogs-text mb-4">数据管理</h2>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-ogs-accent text-white rounded hover:bg-ogs-accent/90 transition-colors"
          >
            导出数据
          </button>
          <label className="px-4 py-2 bg-gray-100 text-ogs-text rounded hover:bg-gray-200 transition-colors cursor-pointer">
            导入数据
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, total, color }: {
  title: string;
  value: number;
  total: number;
  color: 'green' | 'blue' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colorClasses[color]}`}>
      <p className="text-sm text-ogs-muted">{title}</p>
      <p className="text-2xl font-bold text-ogs-text">
        {value} <span className="text-sm text-ogs-muted">/ {total}</span>
      </p>
    </div>
  );
}

function RecentActivityList({ progress }: { progress: Record<string, { josekiId: string; lastStudied: string | null; masteryLevel: string }> }) {
  const recent = Object.values(progress)
    .filter(p => p.lastStudied)
    .sort((a, b) => new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return <p className="text-ogs-muted text-sm">暂无学习记录</p>;
  }

  return (
    <div className="space-y-2">
      {recent.map(item => {
        const joseki = josekiDatabase.find(j => j.id === item.josekiId);
        if (!joseki) return null;

        const levelLabels: Record<string, string> = {
          not_started: '未开始',
          learning: '学习中',
          practiced: '已练习',
          mastered: '已掌握',
        };

        return (
          <div key={item.josekiId} className="flex justify-between items-center p-2 bg-ogs-bg rounded">
            <span className="font-medium text-ogs-text">{joseki.name}</span>
            <div className="text-sm text-ogs-muted">
              <span className="mr-2">{levelLabels[item.masteryLevel]}</span>
              <span>{new Date(item.lastStudied!).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
