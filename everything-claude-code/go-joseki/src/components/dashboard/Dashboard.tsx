import { useProgressStore } from '../../store/progressStore';
import { josekiDatabase } from '../../data/joseki';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trophy, Target, BookOpen } from 'lucide-react';

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
      <h1 className="text-2xl font-bold">学习进度</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="已掌握"
          value={stats.masteredCount}
          total={stats.totalJoseki}
          icon={<Trophy className="h-4 w-4 text-green-500" />}
          color="green"
        />
        <StatCard
          title="学习中"
          value={stats.learningCount}
          total={stats.totalJoseki}
          icon={<BookOpen className="h-4 w-4 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="未开始"
          value={stats.notStartedCount}
          total={stats.totalJoseki}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          color="gray"
        />
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">平均正确率</p>
            <p className={`text-2xl font-bold ${stats.averageAccuracy >= 80 ? 'text-green-500' : stats.averageAccuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {stats.averageAccuracy}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">学习统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">练习次数</p>
              <p className="text-xl font-bold">{stats.totalPracticeSessions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">测验次数</p>
              <p className="text-xl font-bold">{stats.totalQuizzes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近学习</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityList progress={progress} />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                导入数据
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, total, icon, color }: {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-500/10 border-green-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    gray: 'bg-muted border-muted',
  };

  return (
    <Card className={`${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold">
          {value} <span className="text-sm text-muted-foreground">/ {total}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function RecentActivityList({ progress }: { progress: Record<string, { josekiId: string; lastStudied: string | null; masteryLevel: string }> }) {
  const recent = Object.values(progress)
    .filter(p => p.lastStudied)
    .sort((a, b) => new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return <p className="text-muted-foreground text-sm">暂无学习记录</p>;
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

        const levelVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          not_started: 'secondary',
          learning: 'default',
          practiced: 'outline',
          mastered: 'default',
        };

        return (
          <div key={item.josekiId} className="flex justify-between items-center p-2 bg-muted rounded">
            <span className="font-medium">{joseki.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={levelVariants[item.masteryLevel]}>
                {levelLabels[item.masteryLevel]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(item.lastStudied!).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
