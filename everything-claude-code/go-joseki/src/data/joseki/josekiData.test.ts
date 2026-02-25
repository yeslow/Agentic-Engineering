import { describe, it, expect } from 'vitest';
import { josekiDatabase } from './index';
import { filterJoseki, getJosekiById } from './types';

describe('josekiDatabase', () => {
  it('should have exactly 20 joseki patterns', () => {
    expect(josekiDatabase).toHaveLength(20);
  });

  it('should have unique IDs', () => {
    const ids = josekiDatabase.map(j => j.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have required fields for all joseki', () => {
    for (const j of josekiDatabase) {
      expect(j.id).toBeDefined();
      expect(j.name).toBeDefined();
      expect(j.category).toBeDefined();
      expect(j.type).toBeDefined();
      expect(j.difficulty).toBeGreaterThanOrEqual(1);
      expect(j.difficulty).toBeLessThanOrEqual(5);
      expect(j.mainLine).toBeDefined();
      expect(j.explanation).toBeDefined();
      expect(j.keyPoints).toBeDefined();
      expect(j.tags).toBeDefined();
    }
  });

  it('should have valid moves in mainLine', () => {
    for (const j of josekiDatabase) {
      expect(j.mainLine.length).toBeGreaterThan(0);
      for (let i = 0; i < j.mainLine.length; i++) {
        const move = j.mainLine[i];
        expect(move.coordinate).toHaveLength(2);
        expect(move.color).toMatch(/^(black|white)$/);
        expect(move.moveNumber).toBe(i + 1);
      }
    }
  });
});

describe('filterJoseki', () => {
  it('should filter by category', () => {
    const corner = filterJoseki(josekiDatabase, { category: 'corner' });
    expect(corner.every(j => j.category === 'corner')).toBe(true);
  });

  it('should filter by difficulty', () => {
    const easy = filterJoseki(josekiDatabase, { difficulty: 1 });
    expect(easy.every(j => j.difficulty === 1)).toBe(true);
  });

  it('should filter by type', () => {
    const approach = filterJoseki(josekiDatabase, { type: 'approach' });
    expect(approach.every(j => j.type === 'approach')).toBe(true);
  });

  it('should filter by search term', () => {
    const results = filterJoseki(josekiDatabase, { searchTerm: '小目' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(j =>
      j.name.includes('小目') ||
      j.tags.some(t => t.includes('小目'))
    )).toBe(true);
  });

  it('should return all when no filter', () => {
    const all = filterJoseki(josekiDatabase, {});
    expect(all).toHaveLength(20);
  });
});

describe('getJosekiById', () => {
  it('should find joseki by ID', () => {
    const first = josekiDatabase[0];
    const found = getJosekiById(josekiDatabase, first.id);
    expect(found).toEqual(first);
  });

  it('should return undefined for non-existent ID', () => {
    const found = getJosekiById(josekiDatabase, 'non-existent');
    expect(found).toBeUndefined();
  });
});
