import {
    generateKeyBetween as generateKeyBetweenRaw,
    generateNKeysBetween as generateNKeysBetweenRaw,
} from 'fractional-indexing';
import { asFractionalIndex, type FractionalIndex } from './FractionalIndex';

/**
 * Generate a single fractional index key between two existing keys.
 *
 * - Pass `null` for `a` to generate before the first item (prepend).
 * - Pass `null` for `b` to generate after the last item (append).
 * - Pass `null` for both to generate the very first key.
 */
export const generateIndexBetween = (
    a: FractionalIndex | null,
    b: FractionalIndex | null,
): FractionalIndex => asFractionalIndex(generateKeyBetweenRaw(a, b));

/**
 * Generate `n` evenly-spaced fractional index keys between two existing keys.
 *
 * More efficient than calling `generateKeyBetween` in a loop — produces
 * shorter, more evenly distributed keys.
 *
 * - Pass `null` for `a` to generate before the first item.
 * - Pass `null` for `b` to generate after the last item.
 * - Pass `null` for both to generate `n` initial keys from scratch.
 */
export const generateNIndicesBetween = (
    a: FractionalIndex | null,
    b: FractionalIndex | null,
    n: number,
): ReadonlyArray<FractionalIndex> =>
    generateNKeysBetweenRaw(a, b, n).map(key => asFractionalIndex(key));
