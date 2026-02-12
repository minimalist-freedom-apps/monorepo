import { type Brand, brand, String as EvoluString, ok } from '@evolu/common';

/**
 * A branded string representing a fractional index for ordering items
 * in distributed systems. Uses base-62 encoding for compact representation.
 *
 * Fractional indexes support arbitrary insertion between any two existing keys
 * without rewriting other rows — ideal for CRDT-based ordering.
 *
 * **Sorting:** Use `compareFractionalIndex` or native string comparison (`<`, `>`).
 * Do NOT use `String.prototype.localeCompare` — it is case-insensitive and gives wrong order.
 */
export type FractionalIndex = string & Brand<'FractionalIndex'>;

export const asFractionalIndex = (value: string): FractionalIndex => value as FractionalIndex;

/**
 * Evolu Type for `FractionalIndex` — use this in Evolu schema definitions.
 *
 * This is a branded `String` type that can be used directly as a column type
 * in an Evolu schema. It wraps values as `FractionalIndex` at the type level.
 *
 * No runtime validation beyond string check — fractional index strings are
 * always produced by `generateKeyBetween`/`generateNKeysBetween`, so they
 * are valid by construction.
 */
export const FractionalIndexEvoluType = brand('FractionalIndex', EvoluString, value => ok(value));
