import type { Joseki } from './types';

// 高目/目外定式 (4个)

export const takamokuKomoku: Joseki = {
  id: 'takamoku-komoku',
  name: '高目小目挂',
  japaneseName: '高目小目カカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [4, 4], color: 'black', moveNumber: 1, comment: '高目占角' },
    { coordinate: [3, 2], color: 'white', moveNumber: 2, comment: '白棋小目挂，夺取角地' },
    { coordinate: [2, 5], color: 'black', moveNumber: 3, comment: '黑棋飞压' },
    { coordinate: [3, 5], color: 'white', moveNumber: 4, comment: '白棋爬' },
    { coordinate: [2, 6], color: 'black', moveNumber: 5, comment: '黑棋继续压' },
  ],
  variations: [],
  explanation: '高目小目挂是白棋夺取角地的下法。黑棋通常飞压取外势。',
  keyPoints: ['白棋取角地', '黑棋取外势'],
  tags: ['高目', '小目挂'],
};

export const takamokuSanSan: Joseki = {
  id: 'takamoku-sansan',
  name: '高目三三挂',
  japaneseName: '高目三々カカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [4, 4], color: 'black', moveNumber: 1, comment: '高目占角' },
    { coordinate: [2, 2], color: 'white', moveNumber: 2, comment: '白棋三三挂' },
    { coordinate: [3, 3], color: 'black', moveNumber: 3, comment: '黑棋挡' },
    { coordinate: [2, 3], color: 'white', moveNumber: 4, comment: '白棋长' },
    { coordinate: [3, 2], color: 'black', moveNumber: 5, comment: '黑棋挡' },
  ],
  variations: [],
  explanation: '高目三三挂也是白棋取实地的下法。黑棋挡后形成简明变化。',
  keyPoints: ['白棋取实地', '黑棋外势厚实'],
  tags: ['高目', '三三挂'],
};

export const mokuhakuKomoku: Joseki = {
  id: 'mokuhaku-komoku',
  name: '目外小目挂',
  japaneseName: '目外小目カカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 4], color: 'black', moveNumber: 1, comment: '目外占角' },
    { coordinate: [2, 2], color: 'white', moveNumber: 2, comment: '白棋小目挂' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋拆二' },
    { coordinate: [3, 2], color: 'white', moveNumber: 4, comment: '白棋小尖' },
  ],
  variations: [],
  explanation: '目外小目挂是白棋夺取角地的下法。黑棋拆二后白棋小尖。',
  keyPoints: ['白棋取角地', '黑棋向边发展'],
  tags: ['目外', '小目挂'],
};

export const mokuhakuKeima: Joseki = {
  id: 'mokuhaku-keima',
  name: '目外小飞挂',
  japaneseName: '目外ケイマカカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 4], color: 'black', moveNumber: 1, comment: '目外占角' },
    { coordinate: [5, 2], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [3, 2], color: 'black', moveNumber: 3, comment: '黑棋小尖' },
    { coordinate: [6, 3], color: 'white', moveNumber: 4, comment: '白棋拆三' },
  ],
  variations: [],
  explanation: '目外小飞挂是重视边的下法。黑棋小尖守角，白棋拆三。',
  keyPoints: ['白棋重视边', '黑棋守角'],
  tags: ['目外', '小飞挂'],
};
