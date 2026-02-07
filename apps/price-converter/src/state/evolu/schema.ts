import { CurrencyCode, id } from '@evolu/common';
import type { EnsureEvoluDep as EnsureEvoluDepPackage } from '@minimalistic-apps/evolu';

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

/**
 * Provide non-generic type of EnsureEvolu service for easier usage in the app.
 * So we dont need to repeat the schema type everywhere we need to use evolu.
 */
export type EnsureEvoluDep = EnsureEvoluDepPackage<typeof Schema>;
