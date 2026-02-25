import type { Joseki } from './types';

// 小目定式 (6个)

export const komokuLowApproach: Joseki = {
  id: 'komoku-low-approach',
  name: '小目低挂',
  japaneseName: '小目低カカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 1,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角，最常见的占角方式之一' },
    { coordinate: [2, 5], color: 'white', moveNumber: 2, comment: '白棋低挂，最常见的挂角方式' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋一间跳，最基本的应法' },
    { coordinate: [5, 5], color: 'white', moveNumber: 4, comment: '白棋拆二，获得根据地' },
  ],
  variations: [
    {
      id: 'komoku-low-approach-2space',
      name: '二间高夹',
      description: '黑棋选择二间高夹，更为积极',
      moves: [
        { coordinate: [3, 3], color: 'black', moveNumber: 1 },
        { coordinate: [2, 5], color: 'white', moveNumber: 2 },
        { coordinate: [6, 4], color: 'black', moveNumber: 3 },
        { coordinate: [4, 4], color: 'white', moveNumber: 4 },
      ],
    },
  ],
  explanation: '小目低挂是最基本的定式之一。黑棋小目占角后，白棋从三线低挂，黑棋最常见的应手是一间跳或托。这个定式双方都比较坚实。',
  keyPoints: ['黑棋获得角地', '白棋获得边上发展', '双方都比较坚实'],
  tags: ['小目', '低挂', '基本定式', '一间跳'],
};

export const komokuHighApproach: Joseki = {
  id: 'komoku-high-approach',
  name: '小目高挂',
  japaneseName: '小目高カカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角' },
    { coordinate: [2, 4], color: 'white', moveNumber: 2, comment: '白棋高挂，取向中腹势力' },
    { coordinate: [4, 5], color: 'black', moveNumber: 3, comment: '黑棋托，常见应手' },
    { coordinate: [3, 5], color: 'white', moveNumber: 4, comment: '白棋扳' },
    { coordinate: [2, 5], color: 'black', moveNumber: 5, comment: '黑棋退' },
  ],
  variations: [],
  explanation: '小目高挂是白棋重视中腹势力的下法。黑棋通常托角，白棋扳后黑退，形成转换。',
  keyPoints: ['白棋取势', '黑棋取地', '注意中腹的发展'],
  tags: ['小目', '高挂', '取势'],
};

export const komokuOneSpacePincer: Joseki = {
  id: 'komoku-1space-pincer',
  name: '小目一间夹',
  japaneseName: '小目一間ビラキ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'pincer',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角' },
    { coordinate: [2, 5], color: 'white', moveNumber: 2, comment: '白棋低挂' },
    { coordinate: [4, 5], color: 'black', moveNumber: 3, comment: '黑棋一间夹，积极作战' },
    { coordinate: [5, 2], color: 'white', moveNumber: 4, comment: '白棋跳，寻求出头' },
    { coordinate: [5, 4], color: 'black', moveNumber: 5, comment: '黑棋跳，继续攻击' },
  ],
  variations: [],
  explanation: '小目一间夹是黑棋选择作战的下法。白棋需要尽快出头，避免被封锁。',
  keyPoints: ['作战定式', '白棋要出头', '中腹战斗重要'],
  tags: ['小目', '一间夹', '作战'],
};

export const komokuTwoSpacePincer: Joseki = {
  id: 'komoku-2space-pincer',
  name: '小目二间夹',
  japaneseName: '小目二間ビラキ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'pincer',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角' },
    { coordinate: [2, 5], color: 'white', moveNumber: 2, comment: '白棋低挂' },
    { coordinate: [5, 4], color: 'black', moveNumber: 3, comment: '黑棋二间夹' },
    { coordinate: [5, 2], color: 'white', moveNumber: 4, comment: '白棋跳' },
    { coordinate: [4, 5], color: 'black', moveNumber: 5, comment: '黑棋拆二' },
  ],
  variations: [],
  explanation: '小目二间夹比一间夹宽松，白棋更容易处理。',
  keyPoints: ['比一间夹宽松', '白棋有多种选择'],
  tags: ['小目', '二间夹'],
};

export const komokuKeima: Joseki = {
  id: 'komoku-keima',
  name: '小目小飞',
  japaneseName: '小目ケイマ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 1,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角' },
    { coordinate: [5, 4], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋一间跳' },
    { coordinate: [7, 3], color: 'white', moveNumber: 4, comment: '白棋拆三' },
  ],
  variations: [],
  explanation: '小目小飞挂是重视边的下法，黑棋一间跳后白棋拆三获得根据地。',
  keyPoints: ['白棋重视边', '快速获得根据地'],
  tags: ['小目', '小飞挂'],
};

export const komokuOgeima: Joseki = {
  id: 'komoku-ogeima',
  name: '小目大飞',
  japaneseName: '小目オオゲイマ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '小目占角' },
    { coordinate: [6, 4], color: 'white', moveNumber: 2, comment: '白棋大飞挂' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋尖顶' },
    { coordinate: [5, 3], color: 'white', moveNumber: 4, comment: '白棋长' },
  ],
  variations: [],
  explanation: '小目大飞挂是更为宽松的下法，黑棋通常尖顶夺取角地。',
  keyPoints: ['大飞较为宽松', '黑棋夺取角地'],
  tags: ['小目', '大飞挂'],
};
