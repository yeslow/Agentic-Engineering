import type { Joseki } from './types';

// 小目定式 (6个)
import {
  komokuLowApproach,
  komokuHighApproach,
  komokuOneSpacePincer,
  komokuTwoSpacePincer,
  komokuKeima,
  komokuOgeima,
} from './komoku';

// 星位定式 (6个)
import {
  hoshiSanSan,
  hoshiKeima,
  hoshiOgeima,
  hoshiOneSpacePincer,
  hoshiTwoSpacePincer,
  hoshiMukaiKomoku,
} from './hoshi';

// 三三定式 (4个)
import {
  sansanKata,
  sansanKeima,
  sansanOgeima,
  sansanOsae,
} from './sansan';

// 高目/目外定式 (4个)
import {
  takamokuKomoku,
  takamokuSanSan,
  mokuhakuKomoku,
  mokuhakuKeima,
} from './takamoku';

export const josekiDatabase: Joseki[] = [
  // 小目定式
  komokuLowApproach,
  komokuHighApproach,
  komokuOneSpacePincer,
  komokuTwoSpacePincer,
  komokuKeima,
  komokuOgeima,
  // 星位定式
  hoshiSanSan,
  hoshiKeima,
  hoshiOgeima,
  hoshiOneSpacePincer,
  hoshiTwoSpacePincer,
  hoshiMukaiKomoku,
  // 三三定式
  sansanKata,
  sansanKeima,
  sansanOgeima,
  sansanOsae,
  // 高目/目外定式
  takamokuKomoku,
  takamokuSanSan,
  mokuhakuKomoku,
  mokuhakuKeima,
];

export * from './types';
