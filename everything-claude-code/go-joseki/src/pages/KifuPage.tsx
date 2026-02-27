import { KifuList } from '../components/kifu/KifuList';
import { useKifuStore } from '../store/kifuStore';
import { useBoardStore } from '../store/boardStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Grid3x3, Library } from 'lucide-react';

export function KifuPage() {
  const navigate = useNavigate();
  const { getAllKifu, setCurrentKifuId } = useKifuStore();
  const { loadBoard } = useBoardStore();
  const kifuList = getAllKifu();

  const handleLoadKifu = (id: string) => {
    const kifu = useKifuStore.getState().getKifu(id);
    if (kifu) {
      loadBoard(kifu.boardState);
      setCurrentKifuId(id);
      navigate('/');
    }
  };

  const sizeStats = kifuList.reduce(
    (acc, kifu) => {
      acc[kifu.size] = (acc[kifu.size] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6" />
            棋谱列表
          </h1>
          <p className="text-muted-foreground mt-1">
            共 {kifuList.length} 个棋谱
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总计"
          value={kifuList.length}
          icon={<Library className="h-4 w-4 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="19 路"
          value={sizeStats[19] || 0}
          icon={<Grid3x3 className="h-4 w-4 text-green-500" />}
          color="green"
        />
        <StatCard
          title="13 路"
          value={sizeStats[13] || 0}
          icon={<Grid3x3 className="h-4 w-4 text-yellow-500" />}
          color="yellow"
        />
        <StatCard
          title="9 路"
          value={sizeStats[9] || 0}
          icon={<Grid3x3 className="h-4 w-4 text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Kifu List */}
      <Card>
        <CardContent className="p-4">
          <KifuList onLoadKifu={handleLoadKifu} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
  };

  return (
    <Card className={`${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
