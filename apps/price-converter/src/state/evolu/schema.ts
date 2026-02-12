import { CurrencyCode, id, nullOr } from '@evolu/common';
import type { EnsureEvoluDep as EnsureEvoluDepPackage, EvoluStorage } from '@minimalist-apps/evolu';
import { FractionalIndexEvoluType } from '@minimalist-apps/fractional-indexing';

const CurrencyId = id('CurrencyId');
// biome-ignore lint/correctness/noUnusedVariables: Type alias for Evolu schema
type CurrencyId = typeof CurrencyId.Type;

const currency = {
    id: CurrencyId,
    currency: CurrencyCode,
    order: nullOr(FractionalIndexEvoluType),
};

export const Schema = {
    currency,
};

/**
 * Provide non-generic type of EnsureEvolu service for easier usage in the app.
 * So we dont need to repeat the schema type everywhere we need to use evolu.
 */
export type AppEvolu = EvoluStorage<typeof Schema>;

/**
 * Provide non-generic type of EnsureEvolu service for easier usage in the app.
 * So we dont need to repeat the schema type everywhere we need to use evolu.
 */
export type EnsureEvoluDep = EnsureEvoluDepPackage<typeof Schema>;
