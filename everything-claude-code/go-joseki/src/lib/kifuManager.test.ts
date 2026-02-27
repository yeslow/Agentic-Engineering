import { describe, it, expect } from 'vitest';
import { extractKifuNameFromFilename, importKifu } from './kifuManager';

describe('extractKifuNameFromFilename', () => {
  it('should extract name from SGF filename without extension', () => {
    expect(extractKifuNameFromFilename('game.sgf')).toBe('game');
  });

  it('should handle filename with spaces', () => {
    expect(extractKifuNameFromFilename('my game.sgf')).toBe('my game');
  });

  it('should handle filename with Chinese characters', () => {
    expect(extractKifuNameFromFilename('棋谱.sgf')).toBe('棋谱');
  });

  it('should handle filename with .txt extension', () => {
    expect(extractKifuNameFromFilename('game.txt')).toBe('game');
  });

  it('should return default name when filename is empty', () => {
    expect(extractKifuNameFromFilename('')).toBe('导入棋谱');
  });

  it('should return default name when filename is only extension', () => {
    expect(extractKifuNameFromFilename('.sgf')).toBe('导入棋谱');
  });

  it('should handle filename with multiple dots', () => {
    expect(extractKifuNameFromFilename('my.game.name.sgf')).toBe('my.game.name');
  });

  it('should handle uppercase extension', () => {
    expect(extractKifuNameFromFilename('game.SGF')).toBe('game');
  });
});

describe('importKifu', () => {
  it('should return kifuName extracted from filename', async () => {
    // Create a mock File object
    const sgfContent = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd];W[dp])';
    const file = new File([sgfContent], 'test-game.sgf', { type: 'application/x-go-sgf' });

    const result = await importKifu(file);

    expect(result.kifuName).toBe('test-game');
    expect(result.board.size).toBe(19);
    expect(result.board.moveHistory.length).toBe(2);
  });

  it('should return kifuName with Chinese characters from filename', async () => {
    const sgfContent = '(;FF[4]GM[1]SZ[19]AP[GoJoseki];B[dd])';
    const file = new File([sgfContent], '围棋棋谱.sgf', { type: 'application/x-go-sgf' });

    const result = await importKifu(file);

    expect(result.kifuName).toBe('围棋棋谱');
  });
});
