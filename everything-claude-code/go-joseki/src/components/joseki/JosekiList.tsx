import { useJosekiStore } from '../../store/josekiStore';
import type { Joseki } from '../../data/joseki';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface JosekiCardProps {
  joseki: Joseki;
  onSelect: () => void;
}

function JosekiCard({ joseki, onSelect }: JosekiCardProps) {
  const typeLabels: Record<string, string> = {
    approach: '挂角',
    enclosure: '缔角',
    pincer: '夹攻',
    invasion: '点角',
    other: '其他',
  };

  const categoryLabels: Record<string, string> = {
    corner: '角部',
    side: '边上',
    center: '中腹',
  };

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer hover:border-primary/50 transition-colors"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{joseki.name}</CardTitle>
            {joseki.japaneseName && (
              <CardDescription className="text-xs mt-0.5">
                {joseki.japaneseName}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline">{categoryLabels[joseki.category]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {typeLabels[joseki.type]}
          </Badge>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < joseki.difficulty
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {joseki.explanation}
        </p>

        <div className="flex flex-wrap gap-1">
          {joseki.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function JosekiList() {
  const { filteredList, selectJoseki } = useJosekiStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredList.map((joseki) => (
        <JosekiCard
          key={joseki.id}
          joseki={joseki}
          onSelect={() => selectJoseki(joseki.id)}
        />
      ))}
    </div>
  );
}
