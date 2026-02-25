// 坐标类型: [x, y]，0-18 对应 19路棋盘
export type Coordinate = [number, number];

export type StoneColor = 'black' | 'white';

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

export interface Joseki {
  id: string;
  name: string;
  category: 'corner' | 'side' | 'center';
  type: 'approach' | 'enclosure' | 'pincer' | 'invasion' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  boardSize: 9 | 13 | 19;
  mainLine: Move[];
  explanation?: string;
}
