import type { Joseki } from './types';

// 星位定式 (6个)

export const hoshiSanSan: Joseki = {
  id: 'hoshi-san-san',
  name: '星位点三三',
  japaneseName: '星位三々',
  category: 'corner',
  corner: 'bottom-right',
  type: 'invasion',
  difficulty: 1,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [3, 2], color: 'white', moveNumber: 2, comment: '白棋点三三，夺取角地' },
    { coordinate: [2, 4], color: 'black', moveNumber: 3, comment: '黑棋挡' },
    { coordinate: [2, 3], color: 'white', moveNumber: 4, comment: '白棋长' },
    { coordinate: [2, 2], color: 'black', moveNumber: 5, comment: '黑棋扳' },
    { coordinate: [1, 3], color: 'white', moveNumber: 6, comment: '白棋粘' },
  ],
  variations: [],
  explanation: '星位点三三是最基本的定式之一。白棋直接点角夺取实地，黑棋通过挡、扳、粘封锁白棋取外势。',
  keyPoints: ['白棋取角地', '黑棋取外势', '注意封锁的顺序'],
  tags: ['星位', '点三三', '基本定式'],
};

export const hoshiKeima: Joseki = {
  id: 'hoshi-keima',
  name: '星位小飞挂',
  japaneseName: '星位ケイマカカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 1,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [5, 4], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋一间跳' },
    { coordinate: [7, 3], color: 'white', moveNumber: 4, comment: '白棋拆三' },
  ],
  variations: [
    {
      id: 'hoshi-keima-osae',
      name: '黑棋压',
      description: '黑棋选择压，取外势',
      moves: [
        { coordinate: [3, 3], color: 'black', moveNumber: 1 },
        { coordinate: [5, 4], color: 'white', moveNumber: 2 },
        { coordinate: [2, 5], color: 'black', moveNumber: 3 },
        { coordinate: [3, 5], color: 'white', moveNumber: 4 },
        { coordinate: [4, 5], color: 'black', moveNumber: 5 },
      ],
    },
  ],
  explanation: '星位小飞挂是最常见的挂角方式。黑棋一间跳是基本应手，白棋拆三获得根据地。',
  keyPoints: ['最常见的定式', '双方都比较简明'],
  tags: ['星位', '小飞挂', '基本定式'],
};

export const hoshiOgeima: Joseki = {
  id: 'hoshi-ogeima',
  name: '星位大飞挂',
  japaneseName: '星位オオゲイマ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [6, 4], color: 'white', moveNumber: 2, comment: '白棋大飞挂' },
    { coordinate: [5, 2], color: 'black', moveNumber: 3, comment: '黑棋尖顶' },
    { coordinate: [5, 3], color: 'white', moveNumber: 4, comment: '白棋长' },
    { coordinate: [6, 3], color: 'black', moveNumber: 5, comment: '黑棋跳' },
  ],
  variations: [],
  explanation: '星位大飞挂较为宽松，黑棋通常尖顶夺取角地。',
  keyPoints: ['大飞较为宽松', '黑棋夺取角地'],
  tags: ['星位', '大飞挂'],
};

export const hoshiOneSpacePincer: Joseki = {
  id: 'hoshi-1space-pincer',
  name: '星位一间夹',
  japaneseName: '星位一間ビラキ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'pincer',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [5, 4], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [4, 5], color: 'black', moveNumber: 3, comment: '黑棋一间夹' },
    { coordinate: [5, 2], color: 'white', moveNumber: 4, comment: '白棋点三三' },
    { coordinate: [2, 4], color: 'black', moveNumber: 5, comment: '黑棋挡' },
  ],
  variations: [],
  explanation: '星位一间夹是积极的作战下法。白棋通常点三三转换，形成复杂的战斗。',
  keyPoints: ['作战定式', '点三三转换常见'],
  tags: ['星位', '一间夹', '作战'],
};

export const hoshiTwoSpacePincer: Joseki = {
  id: 'hoshi-2space-pincer',
  name: '星位二间夹',
  japaneseName: '星位二間ビラキ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'pincer',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [5, 4], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [5, 5], color: 'black', moveNumber: 3, comment: '黑棋二间夹' },
    { coordinate: [7, 3], color: 'white', moveNumber: 4, comment: '白棋拆二' },
    { coordinate: [4, 5], color: 'black', moveNumber: 5, comment: '黑棋跳' },
  ],
  variations: [],
  explanation: '星位二间夹较为宽松，白棋可以轻松处理。',
  keyPoints: ['比一间夹宽松', '白棋容易处理'],
  tags: ['星位', '二间夹'],
};

export const hoshiMukaiKomoku: Joseki = {
  id: 'hoshi-mukai-komoku',
  name: '星位对小目',
  japaneseName: '星位対小目',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [3, 3], color: 'black', moveNumber: 1, comment: '星位占角' },
    { coordinate: [15, 3], color: 'white', moveNumber: 2, comment: '白棋小目占角' },
    { coordinate: [2, 5], color: 'black', moveNumber: 3, comment: '黑棋低挂' },
    { coordinate: [5, 2], color: 'white', moveNumber: 4, comment: '白棋一间跳' },
  ],
  variations: [],
  explanation: '星位对小目的布局。黑棋选择挂角，形成对称的局面。',
  keyPoints: ['对称局面', '双方发展方向相反'],
  tags: ['星位', '小目', '布局'],
};
