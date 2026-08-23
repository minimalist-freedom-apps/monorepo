import { getOrThrow } from '@evolu/common';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createLocalStorage } from './createLocalStorage';

describe(createLocalStorage.name, () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('removes a value', () => {
        const removeItem = vi.fn();
        vi.stubGlobal('localStorage', { removeItem });

        const result = createLocalStorage().remove('legacy-mnemonic');

        getOrThrow(result);
        expect(removeItem).toHaveBeenCalledWith('legacy-mnemonic');
    });

    test('returns a storage error when removal fails', () => {
        vi.stubGlobal('localStorage', {
            removeItem: () => {
                throw new Error('blocked');
            },
        });

        const result = createLocalStorage().remove('legacy-mnemonic');

        expect(result.ok).toBe(false);

        if (result.ok === false) {
            expect(result.error.type).toBe('StorageError');
        }
    });
});
