import { useJosekiStore } from '../../store/josekiStore';
import type { Joseki } from '../../data/joseki';

interface JosekiCardProps {
  joseki: Joseki;
  onSelect: () => void;
}

function JosekiCard({ joseki, onSelect }: JosekiCardProps) {
  const difficultyStars = '★'.repeat(joseki.difficulty) + '☆'.repeat(5 - joseki.difficulty);

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
    <div
      onClick={onSelect}
      className="bg-white rounded-lg shadow-sm border border-ogs-border p-4 cursor-pointer hover:shadow-md hover:border-ogs-accent transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-ogs-text">{joseki.name}</h3>
        <span className="text-xs bg-ogs-bg px-2 py-1 rounded text-ogs-muted">
          {categoryLabels[joseki.category]}
        </span>
      </div>

      {joseki.japaneseName && (
        <p className="text-xs text-ogs-muted mb-2">{joseki.japaneseName}</p>
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
          {typeLabels[joseki.type]}
        </span>
        <span className="text-xs text-yellow-600">{difficultyStars}</span>
      </div>

      <p className="text-sm text-ogs-muted line-clamp-2">{joseki.explanation}</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {joseki.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
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
