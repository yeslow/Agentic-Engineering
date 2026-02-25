import type { Joseki } from './types';

// 三三定式 (4个)

export const sansanKata: Joseki = {
  id: 'sansan-kata',
  name: '三三肩冲',
  japaneseName: '三三カタツキ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'invasion',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [2, 2], color: 'black', moveNumber: 1, comment: '三三占角' },
    { coordinate: [2, 5], color: 'white', moveNumber: 2, comment: '白棋肩冲，限制黑棋发展' },
    { coordinate: [3, 2], color: 'black', moveNumber: 3, comment: '黑棋长，向边发展' },
    { coordinate: [2, 6], color: 'white', moveNumber: 4, comment: '白棋长' },
    { coordinate: [4, 2], color: 'black', moveNumber: 5, comment: '黑棋继续长' },
  ],
  variations: [],
  explanation: '三三肩冲是限制三三发展的常用手段。黑棋通常向边长，白棋取外势。',
  keyPoints: ['白棋取外势', '黑棋向边发展', '注意长出的时机'],
  tags: ['三三', '肩冲'],
};

export const sansanKeima: Joseki = {
  id: 'sansan-keima',
  name: '三三小飞挂',
  japaneseName: '三三ケイマカカリ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [2, 2], color: 'black', moveNumber: 1, comment: '三三占角' },
    { coordinate: [4, 3], color: 'white', moveNumber: 2, comment: '白棋小飞挂' },
    { coordinate: [3, 4], color: 'black', moveNumber: 3, comment: '黑棋跳' },
    { coordinate: [5, 2], color: 'white', moveNumber: 4, comment: '白棋拆二' },
  ],
  variations: [],
  explanation: '三三小飞挂是较为温和的下法。黑棋跳后白棋拆二，双方都比较简明。',
  keyPoints: ['较为温和', '双方简明'],
  tags: ['三三', '小飞挂'],
};

export const sansanOgeima: Joseki = {
  id: 'sansan-ogeima',
  name: '三三大飞挂',
  japaneseName: '三三オオゲイマ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'approach',
  difficulty: 2,
  boardSize: 19,
  mainLine: [
    { coordinate: [2, 2], color: 'black', moveNumber: 1, comment: '三三占角' },
    { coordinate: [5, 3], color: 'white', moveNumber: 2, comment: '白棋大飞挂' },
    { coordinate: [3, 4], color: 'black', moveNumber: 3, comment: '黑棋跳' },
    { coordinate: [6, 2], color: 'white', moveNumber: 4, comment: '白棋拆二' },
  ],
  variations: [],
  explanation: '三三大飞挂较为宽松，黑棋可以轻松应对。',
  keyPoints: ['大飞较为宽松', '黑棋容易应对'],
  tags: ['三三', '大飞挂'],
};

export const sansanOsae: Joseki = {
  id: 'sansan-osae',
  name: '三三压长',
  japaneseName: '三三オサエ',
  category: 'corner',
  corner: 'bottom-right',
  type: 'invasion',
  difficulty: 3,
  boardSize: 19,
  mainLine: [
    { coordinate: [2, 2], color: 'black', moveNumber: 1, comment: '三三占角' },
    { coordinate: [2, 3], color: 'white', moveNumber: 2, comment: '白棋压' },
    { coordinate: [2, 4], color: 'black', moveNumber: 3, comment: '黑棋长' },
    { coordinate: [3, 3], color: 'white', moveNumber: 4, comment: '白棋长' },
    { coordinate: [4, 3], color: 'black', moveNumber: 5, comment: '黑棋长出' },
  ],
  variations: [],
  explanation: '三三压长是白棋取外势的下法。黑棋长后可以获得实地。',
  keyPoints: ['白棋取外势', '黑棋取实地'],
  tags: ['三三', '压长'],
};
