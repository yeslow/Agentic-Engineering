// 坐标类型: [x, y]，0-18 对应 19路棋盘
export type Coordinate = [number, number];

export type StoneColor = 'black' | 'white';

export type GameMode = 'battle' | 'trial';

export interface Move {
  coordinate: Coordinate;
  color: StoneColor;
  moveNumber: number;
  comment?: string;
}

export interface BoardState {
  size: 9 | 13 | 19;
  stones: {
    black: Coordinate[];
    white: Coordinate[];
  };
  captures: {
    black: number;
    white: number;
  };
  koPoint: Coordinate | null;
  lastMove: Coordinate | null;
  moveHistory: Move[];
  currentMoveNumber: number;
}

export interface Variation {
  id: string;
  name: string;
  parentId: string;
  boardState: BoardState;
  trialStones: {
    black: Coordinate[];
    white: Coordinate[];
  };
  trialCapturedStones: {
    black: Coordinate[];
    white: Coordinate[];
  };
  trialMoveHistory: Array<{ coordinate: Coordinate; color: StoneColor }>;
  moveCount: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}
