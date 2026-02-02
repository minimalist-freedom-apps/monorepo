import { CurrencyCode, id } from '@evolu/common';

const CurrencyId = id('CurrencyId');
// biome-ignore lint/correctness/noUnusedVariables: Type alias for Evolu schema
type CurrencyId = typeof CurrencyId.Type;

const currency = {
    id: CurrencyId,
    currency: CurrencyCode,
};

export const Schema = {
    currency,
};
