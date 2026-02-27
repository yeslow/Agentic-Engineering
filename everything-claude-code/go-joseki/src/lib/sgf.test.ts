import { describe, it, expect } from 'vitest';
import { boardToSgf, sgfToBoard, isValidSgf, getSgfMetadata } from './sgf';

describe('SGF Serialization', () => {
  describe('boardToSgf', () => {
    it('should convert empty board to SGF', () => {
      const board = {
        size: 19 as const,
        stones: { black: [] as [number, number][], white: [] as [number, number][] },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: null,
        moveHistory: [],
        currentMoveNumber: 0,
      };
      const sgf = boardToSgf(board);

      expect(sgf).toContain('(;');
      expect(sgf).toContain('FF[4]');
      expect(sgf).toContain('GM[1]');
      expect(sgf).toContain('SZ[19]');
      expect(sgf).toContain('AP[GoJoseki]');
      expect(sgf).toContain(')');
    });

    it('should convert board with moves to SGF', () => {
      const board = {
        size: 19 as const,
        stones: {
          black: [[3, 3], [3, 15]] as [number, number][],
          white: [[15, 15]] as [number, number][]
        },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: [15, 15] as [number, number],
        moveHistory: [
          { coordinate: [3, 3] as [number, number], color: 'black' as const, moveNumber: 1 },
          { coordinate: [15, 15] as [number, number], color: 'white' as const, moveNumber: 2 },
          { coordinate: [3, 15] as [number, number], color: 'black' as const, moveNumber: 3 },
        ],
        currentMoveNumber: 3,
      };
      const sgf = boardToSgf(board);

      expect(sgf).toContain(';B[dd]'); // 3,3 = dd in SGF
      expect(sgf).toContain(';W[pp]'); // 15,15 = pp in SGF
      expect(sgf).toContain(';B[dp]'); // 3,15 = dp in SGF
    });

    it('should handle 9x9 board', () => {
      const board = {
        size: 9 as const,
        stones: { black: [], white: [] },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: null,
        moveHistory: [],
        currentMoveNumber: 0,
      };
      const sgf = boardToSgf(board);
      expect(sgf).toContain('SZ[9]');
    });

    it('should handle 13x13 board', () => {
      const board = {
        size: 13 as const,
        stones: { black: [], white: [] },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: null,
        moveHistory: [],
        currentMoveNumber: 0,
      };
      const sgf = boardToSgf(board);
      expect(sgf).toContain('SZ[13]');
    });

    it('should include capture information', () => {
      const board = {
        size: 19 as const,
        stones: { black: [], white: [] },
        captures: { black: 5, white: 3 },
        koPoint: null,
        lastMove: null,
        moveHistory: [],
        currentMoveNumber: 0,
      };
      const sgf = boardToSgf(board);
      expect(sgf).toContain('C[Black captures: 5, White captures: 3]');
    });
  });

  describe('sgfToBoard', () => {
    it('should parse empty board SGF', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.size).toBe(19);
      expect(board.stones.black).toHaveLength(0);
      expect(board.stones.white).toHaveLength(0);
      expect(board.currentMoveNumber).toBe(0);
    });

    it('should parse SGF with moves', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[pp];B[dp])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.size).toBe(19);
      expect(board.moveHistory).toHaveLength(3);
      expect(board.stones.black).toHaveLength(2);
      expect(board.stones.white).toHaveLength(1);
    });

    it('should parse 9x9 board SGF', () => {
      const sgf = '(;FF[4]GM[1]SZ[9]AP[GoJoseki];B[dd];W[ee])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.size).toBe(9);
    });

    it('should handle moves with comments', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd]C[Good move];W[pp])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.moveHistory).toHaveLength(2);
      expect(board.moveHistory[0].comment).toBe('Good move');
    });

    it('should reconstruct board state correctly', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd];W[dc])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.currentMoveNumber).toBe(4);
      expect(board.stones.black).toHaveLength(2);
      expect(board.stones.white).toHaveLength(2);
      // dc in SGF = [3, 2] in coordinates
      expect(board.lastMove).toEqual([3, 2]);
    });
  });

  describe('round-trip', () => {
    it('should preserve currentMoveNumber equals to moveHistory.length', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[pp];B[dp];W[pd])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // This test verifies currentMoveNumber equals moveHistory.length
      expect(board.currentMoveNumber).toBe(board.moveHistory.length);
    });

    it('should preserve currentMoveNumber after serialize and deserialize', () => {
      const original = {
        size: 19 as const,
        stones: {
          black: [[3, 3], [3, 15]] as [number, number][],
          white: [[15, 15], [15, 3]] as [number, number][]
        },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: [15, 3] as [number, number],
        moveHistory: [
          { coordinate: [3, 3] as [number, number], color: 'black' as const, moveNumber: 1 },
          { coordinate: [15, 15] as [number, number], color: 'white' as const, moveNumber: 2 },
          { coordinate: [3, 15] as [number, number], color: 'black' as const, moveNumber: 3 },
          { coordinate: [15, 3] as [number, number], color: 'white' as const, moveNumber: 4 },
        ],
        currentMoveNumber: 4,
      };

      const sgf = boardToSgf(original);
      const result = sgfToBoard(sgf);
      const board = result.board;

      // This test verifies currentMoveNumber is preserved correctly
      expect(board.currentMoveNumber).toBe(original.currentMoveNumber);
    });

    it('should correctly parse SGF and have matching currentMoveNumber and moveHistory.length', () => {
      // Create a SGF with 10 moves
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd];W[dc];B[ec];W[ed];B[cd];W[cc];B[de];W[ep])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Expected: 10 moves
      expect(board.moveHistory.length).toBe(10);
      expect(board.currentMoveNumber).toBe(10);
      expect(board.currentMoveNumber).toBe(board.moveHistory.length);
    });

    it('should preserve board state for 9x9 game', () => {
      const original = {
        size: 9 as const,
        stones: {
          black: [[2, 2], [2, 6]] as [number, number][],
          white: [[6, 6]] as [number, number][]
        },
        captures: { black: 0, white: 0 },
        koPoint: null,
        lastMove: [6, 6] as [number, number],
        moveHistory: [
          { coordinate: [2, 2] as [number, number], color: 'black' as const, moveNumber: 1 },
          { coordinate: [6, 6] as [number, number], color: 'white' as const, moveNumber: 2 },
          { coordinate: [2, 6] as [number, number], color: 'black' as const, moveNumber: 3 },
        ],
        currentMoveNumber: 3,
      };

      const sgf = boardToSgf(original);
      const result = sgfToBoard(sgf);
      const board = result.board;

      expect(board.size).toBe(9);
      expect(board.moveHistory.length).toBe(3);
    });
  });

  describe('isValidSgf', () => {
    it('should return true for valid SGF', () => {
      expect(isValidSgf('(;FF[4]GM[1]SZ[19])')).toBe(true);
      expect(isValidSgf('(;FF[4]GM[1]SZ[9];B[dd])')).toBe(true);
    });

    it('should return false for invalid input', () => {
      expect(isValidSgf('')).toBe(false);
      expect(isValidSgf('not sgf')).toBe(false);
    });
  });

  describe('getSgfMetadata', () => {
    it('should extract metadata from SGF', () => {
      const sgf = '(;FF[4]GM[1]SZ[13];B[dd];W[ee];B[cc])';
      const metadata = getSgfMetadata(sgf);

      expect(metadata.size).toBe(13);
      expect(metadata.moveCount).toBe(3);
      expect(metadata.hasCaptures).toBe(false);
    });
  });

  describe('sgfToBoard player names', () => {
    it('should extract black player name from PB property', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]PB[Black Player]PW[White Player]AP[GoJoseki];B[dd];W[dp])';
      const result = sgfToBoard(sgf);

      expect(result.blackPlayer).toBe('Black Player');
      expect(result.whitePlayer).toBe('White Player');
    });

    it('should handle Chinese player names', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]PB[黑方棋手]PW[白方棋手]AP[GoJoseki];B[dd];W[dp])';
      const result = sgfToBoard(sgf);

      expect(result.blackPlayer).toBe('黑方棋手');
      expect(result.whitePlayer).toBe('白方棋手');
    });

    it('should return undefined when player names are not provided', () => {
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp])';
      const result = sgfToBoard(sgf);

      expect(result.blackPlayer).toBeUndefined();
      expect(result.whitePlayer).toBeUndefined();
    });
  });

  describe('sgfToBoard with invalid moves', () => {
    it('should handle SGF with invalid moves and keep currentMoveNumber consistent with moveHistory.length', () => {
      // This SGF has a move that plays on an occupied spot (dd is played twice)
      // The second dd move should be skipped, and currentMoveNumber should match moveHistory.length
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dd];B[dp])';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // The second move (W[dd]) is invalid because dd is already occupied
      // So only 2 moves should be recorded (B[dd] and B[dp])
      expect(board.moveHistory.length).toBe(board.currentMoveNumber);
    });
  });

  describe('sgfToBoard with variations', () => {
    it('should only parse main line moves and ignore variations', () => {
      // SGF with a variation - main line has 3 moves, variation has 2 moves
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd](;W[dc];B[ec]))';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Should only have 3 moves from main line, not 5
      expect(board.moveHistory.length).toBe(3);
      expect(board.currentMoveNumber).toBe(3);
    });

    it('should handle SGF with multiple variations', () => {
      // SGF with multiple variations - main line has 2 moves
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp](;B[pd])(;B[dc]))';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Should only have 2 moves from main line
      expect(board.moveHistory.length).toBe(2);
    });

    it('should handle nested variations', () => {
      // SGF with nested variations
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp];B[pd](;W[dc](;B[aa]);B[ec]))';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Should only have 3 moves from main line
      expect(board.moveHistory.length).toBe(3);
    });

    it('should handle SGF where all moves are in the first variation', () => {
      // Some SGF files put all moves in the first variation
      // (;FF[4]...(;B[dd];W[dp];B[pd]))
      const sgf = '(;FF[4]GM[1]SZ[19]AP[GoJoseki](;B[dd];W[dp];B[pd];W[dc]))';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Should have 4 moves from the first variation
      expect(board.moveHistory.length).toBe(4);
    });

    it('should handle nested format where each move is followed by a variation', () => {
      // Some SGF files from SGFC have a nested format where each move
      // is immediately followed by a variation containing the rest of the game
      // Format: (;FF[4]...;B[pd](;W[dd](;B[qp](;W[dp]...))))
      const sgf = '(;FF[4]GM[1]SZ[19]AP[SGFC:2.0];B[pd](;W[dd](;B[qp](;W[dp](;B[cc](;W[dc]))))))';
      const result = sgfToBoard(sgf);
      const board = result.board;

      // Should have 6 moves chained through the nested variations
      expect(board.moveHistory.length).toBe(6);
      expect(board.moveHistory[0].coordinate).toEqual([15, 3]); // B[pd]: p=15, d=3
      expect(board.moveHistory[1].coordinate).toEqual([3, 3]);  // W[dd]: d=3, d=3
      expect(board.moveHistory[2].coordinate).toEqual([16, 15]); // B[qp]: q=16, p=15
      expect(board.moveHistory[3].coordinate).toEqual([3, 15]); // W[dp]: d=3, p=15
      expect(board.moveHistory[4].coordinate).toEqual([2, 2]);  // B[cc]: c=2, c=2
      expect(board.moveHistory[5].coordinate).toEqual([3, 2]);  // W[dc]: d=3, c=2
    });
  });
});

describe('SGF Coordinate Conversion', () => {
  it('should handle corner positions', () => {
    const sgf = '(;FF[4]GM[1]SZ[19];B[aa])';
    const result = sgfToBoard(sgf);
    const board = result.board;
    expect(board.stones.black[0]).toEqual([0, 0]);
  });

  it('should handle opposite corner', () => {
    const sgf = '(;FF[4]GM[1]SZ[19];B[ss])';
    const result = sgfToBoard(sgf);
    const board = result.board;
    expect(board.stones.black[0]).toEqual([18, 18]);
  });
});
