import { useKifuStore } from '../../store/kifuStore';
import { useBoardStore } from '../../store/boardStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Play, GitBranch } from 'lucide-react';
import { useMemo } from 'react';
import type { Variation } from '../../types/go';

interface VariationListProps {
  parentId?: string;
  parentMoveNumber?: number; // Optional: filter by parent move number
}

export function VariationList({ parentId, parentMoveNumber }: VariationListProps) {
  // Subscribe to stable references
  const variationsRef = useKifuStore((state) => state.variations);
  const currentKifuId = useKifuStore((state) => state.currentKifuId);
  const removeVariation = useKifuStore((state) => state.removeVariation);
  const { loadVariation } = useBoardStore();

  // Memoize processed variations
  const variations = useMemo(() => {
    const allVariations = Object.values(variationsRef);
    const sorted = allVariations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Filter by parent kifu ID
    let filtered = sorted.filter((v) => v.parentId === parentId);

    // If parentMoveNumber is provided, also filter by move number
    // (variations created from a specific board state)
    if (parentMoveNumber !== undefined) {
      filtered = filtered.filter((v) => v.boardState.currentMoveNumber === parentMoveNumber);
    }

    return filtered;
  }, [variationsRef, parentId, parentMoveNumber]);

  const handleLoadVariation = (variationId: string) => {
    const variation = useKifuStore.getState().getVariation(variationId);
    if (variation) {
      // Load the variation with board state, trial stones, and move history
      loadVariation(
        variation.boardState,
        variation.trialStones,
        variation.trialCapturedStones,
        variation.trialMoveHistory
      );
      // Set as current variation
      useKifuStore.getState().setCurrentVariationId(variationId);
    }
  };

  // Don't show variation list if no parent kifu is loaded
  if (!parentId && !currentKifuId) {
    return null;
  }

  if (variations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            变化图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无变化图</p>
            <p className="text-sm mt-1">
              在试下模式下保存变化图
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          变化图
        </CardTitle>
        <CardDescription>共 {variations.length} 个变化图</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {variations.map((variation) => (
            <VariationItem
              key={variation.id}
              variation={variation}
              onLoad={() => handleLoadVariation(variation.id)}
              onDelete={() => removeVariation(variation.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface VariationItemProps {
  variation: Variation;
  onLoad: () => void;
  onDelete: () => void;
}

function VariationItem({ variation, onLoad, onDelete }: VariationItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
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
    <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{variation.name}</p>
          <Badge variant="secondary" className="text-xs">
            {variation.trialStones.black.length + variation.trialStones.white.length} 手
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(variation.createdAt)}
        </p>
        {variation.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {variation.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="default"
          size="sm"
          onClick={onLoad}
        >
          <Play className="h-3 w-3" />
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
    </div>
  );
}
