import { CurrencyCode, brand } from '@evolu/common';

export const FiatAmount = brand('FiatAmount', CurrencyCode);

export type FiatAmount = typeof FiatAmount.Type;
