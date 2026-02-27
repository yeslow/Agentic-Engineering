import { useKifuStore } from '../../store/kifuStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Play, Calendar, Grid3x3 } from 'lucide-react';

interface KifuListProps {
  onLoadKifu: (id: string) => void;
}

export function KifuList({ onLoadKifu }: KifuListProps) {
  const { getAllKifu, removeKifu } = useKifuStore();
  const kifuList = getAllKifu();

  if (kifuList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无保存的棋谱</p>
        <p className="text-sm text-muted-foreground mt-2">
          在棋盘页面下棋后点击"保存"按钮
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kifuList.map((kifu) => (
        <KifuCard
          key={kifu.id}
          kifu={kifu}
          onLoad={() => onLoadKifu(kifu.id)}
          onDelete={() => removeKifu(kifu.id)}
        />
      ))}
    </div>
  );
}

interface KifuCardProps {
  kifu: import('../../store/kifuStore').KifuRecord;
  onLoad: () => void;
  onDelete: () => void;
}

function KifuCard({ kifu, onLoad, onDelete }: KifuCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{kifu.name}</CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(kifu.createdAt)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Grid3x3 className="h-3 w-3" />
            {kifu.size}路
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {kifu.moveCount} 手
          </Badge>
          {kifu.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {kifu.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onLoad}
            className="flex-1"
          >
            <Play className="h-3 w-3 mr-1" />
            加载
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
