import { sgfToBoard } from '../../lib/sgf';
import type { KifuRecord } from '../../store/kifuStore';

/**
 * Load the default kifu from the SGF file
 * Returns the kifu record ready to be added to the store
 */
export async function loadDefaultKifu(): Promise<Omit<KifuRecord, 'id' | 'createdAt' | 'updatedAt'> | null> {
  try {
    // Fetch the SGF file from the public folder
    const response = await fetch('./data/kifu/default.sgf');
    if (!response.ok) {
      throw new Error('Failed to fetch default kifu');
    }
    const sgfContent = await response.text();
    const { board, blackPlayer, whitePlayer, winner } = sgfToBoard(sgfContent);

    return {
      name: '柯洁 vs 王泽锦',
      boardState: board,
      moveCount: board.moveHistory.length,
      size: board.size,
      blackPlayer,
      whitePlayer,
      winner,
      description: '第 27 届中国围棋甲联赛第 11 轮',
    };
  } catch (error) {
    console.error('Failed to load default kifu:', error);
    return null;
  }
}
