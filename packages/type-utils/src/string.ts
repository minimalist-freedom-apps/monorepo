/**
 * Utility to be used mostly in React components to check for non-empty strings.
 */
export const isNonEmpty = <T>(value: T): value is Exclude<T, null | undefined | boolean> =>
    value !== undefined &&
    value !== null &&
    value !== false &&
    (typeof value !== 'string' || value !== '');
