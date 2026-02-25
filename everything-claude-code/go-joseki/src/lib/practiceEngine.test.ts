import { describe, it, expect } from 'vitest';
import {
  createPracticeSession,
  checkUserMove,
  getHint,
  isJosekiComplete,
  calculateAccuracy,
  type PracticeSession,
} from './practiceEngine';
import { josekiDatabase } from '../data/joseki';

describe('createPracticeSession', () => {
  it('should create a practice session for a joseki', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    expect(session.josekiId).toBe(joseki.id);
    expect(session.currentMoveIndex).toBe(0);
    expect(session.userMoves).toEqual([]);
    expect(session.hintsUsed).toBe(0);
    expect(session.mistakes).toBe(0);
    expect(session.isComplete).toBe(false);
  });
});

describe('checkUserMove', () => {
  it('should accept correct move', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);
    const correctMove = joseki.mainLine[0];

    const result = checkUserMove(session, joseki, correctMove.coordinate);

    expect(result.isCorrect).toBe(true);
    expect(result.nextMove).toBeDefined();
    expect(session.currentMoveIndex).toBe(1);
    expect(session.userMoves).toHaveLength(1);
  });

  it('should reject incorrect move', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    // Try a random incorrect move
    const result = checkUserMove(session, joseki, [0, 0]);

    expect(result.isCorrect).toBe(false);
    expect(result.correctMove).toBeDefined();
    expect(session.mistakes).toBe(1);
  });

  it('should complete when all moves are correct', () => {
    const joseki = josekiDatabase.find(j => j.mainLine.length <= 4)!;
    const session = createPracticeSession(joseki);

    // Play all moves correctly
    for (let i = 0; i < joseki.mainLine.length; i++) {
      const move = joseki.mainLine[i];
      checkUserMove(session, joseki, move.coordinate);
    }

    expect(session.isComplete).toBe(true);
    expect(session.currentMoveIndex).toBe(joseki.mainLine.length);
  });
});

describe('getHint', () => {
  it('should return hint for current move', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    const hint = getHint(session, joseki);

    expect(hint).toBeDefined();
    expect(hint?.coordinate).toEqual(joseki.mainLine[0].coordinate);
    expect(session.hintsUsed).toBe(1);
  });

  it('should return null when joseki is complete', () => {
    // Use first joseki and simulate completion
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    // Complete the joseki
    for (const move of joseki.mainLine) {
      checkUserMove(session, joseki, move.coordinate);
    }

    const hint = getHint(session, joseki);
    expect(hint).toBeNull();
  });
});

describe('isJosekiComplete', () => {
  it('should return false for incomplete joseki', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    expect(isJosekiComplete(session, joseki)).toBe(false);
  });

  it('should return true when all moves played', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    for (const move of joseki.mainLine) {
      checkUserMove(session, joseki, move.coordinate);
    }

    expect(isJosekiComplete(session, joseki)).toBe(true);
  });
});

describe('calculateAccuracy', () => {
  it('should return 100% for perfect session', () => {
    const joseki = josekiDatabase[0];
    const session = createPracticeSession(joseki);

    for (const move of joseki.mainLine) {
      checkUserMove(session, joseki, move.coordinate);
    }

    expect(calculateAccuracy(session, joseki)).toBe(100);
  });

  it('should return lower accuracy for mistakes', () => {
    const session: PracticeSession = {
      josekiId: 'test',
      currentMoveIndex: 4,
      userMoves: [],
      hintsUsed: 0,
      mistakes: 1,
      isComplete: true,
    };

    const accuracy = calculateAccuracy(session, { mainLine: { length: 4 } } as any);
    expect(accuracy).toBeLessThan(100);
  });
});
