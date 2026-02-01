import { brand, Number as NumberType } from '@evolu/common';

export const AmountBtc = brand('AmountBtc', NumberType);
export type AmountBtc = typeof AmountBtc.Type;

export const AmountSats = brand('AmountSats', NumberType);
export type AmountSats = typeof AmountSats.Type;
