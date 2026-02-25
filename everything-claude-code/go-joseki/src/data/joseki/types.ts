import type { Move, Coordinate } from '../../types/go';

export interface JosekiVariation {
  id: string;
  name: string;
  description?: string;
  moves: Move[];
  variations?: JosekiVariation[];
}

export interface Joseki {
  id: string;
  name: string;
  japaneseName?: string;
  category: 'corner' | 'side' | 'center';
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  type: 'approach' | 'enclosure' | 'pincer' | 'invasion' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  boardSize: 9 | 13 | 19;
  initialPosition?: {
    black: Coordinate[];
    white: Coordinate[];
  };
  mainLine: Move[];
  variations: JosekiVariation[];
  explanation: string;
  keyPoints: string[];
  tags: string[];
}

export interface JosekiFilter {
  category?: Joseki['category'];
  corner?: Joseki['corner'];
  type?: Joseki['type'];
  difficulty?: number;
  searchTerm?: string;
}

export function filterJoseki(josekiList: Joseki[], filter: JosekiFilter): Joseki[] {
  return josekiList.filter(j => {
    if (filter.category && j.category !== filter.category) return false;
    if (filter.corner && j.corner !== filter.corner) return false;
    if (filter.type && j.type !== filter.type) return false;
    if (filter.difficulty && j.difficulty !== filter.difficulty) return false;
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      const matchName = j.name.toLowerCase().includes(term);
      const matchDesc = j.explanation?.toLowerCase().includes(term);
      const matchTags = j.tags.some(t => t.toLowerCase().includes(term));
      if (!matchName && !matchDesc && !matchTags) return false;
    }
    return true;
  });
}

export function getJosekiById(josekiList: Joseki[], id: string): Joseki | undefined {
  return josekiList.find(j => j.id === id);
}

export function getMovesAtPosition(
  joseki: Joseki,
  moveNumber: number
): { mainLine: Move[]; availableVariations: JosekiVariation[] } {
  const mainLine = joseki.mainLine.slice(0, moveNumber);

  // Simplified: return all variations for now
  const availableVariations: JosekiVariation[] = [];
  if (moveNumber === 0 && joseki.variations) {
    availableVariations.push(...joseki.variations);
  }

  return { mainLine, availableVariations };
}
