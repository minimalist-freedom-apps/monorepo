import { getOrThrow, Mnemonic, ok } from '@evolu/common';
import {
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { LocalStorage } from '@minimalist-apps/local-storage';
import { describe, expect, test } from 'vitest';
import type { AppState } from '../appStore/AppState';
import { mapLocalStorageToState, mapStateLocalStorage } from './storageMaps';

const initState: AppState = {
    themeMode: 'dark',
    debugMode: true,
    evoluMnemonic: getOrThrow(
        Mnemonic.fromUnknown(
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        ),
    ),
    currentScreen: 'Chat',
    activeOwnerAppId: null,
};

describe('storageMaps', () => {
    test('does not persist or load the mnemonic', () => {
        const data: Record<string, unknown> = {};

        const localStorage: LocalStorage = {
            load: <T>(key: string) => ok((data[key] ?? null) as T | null),
            save: (key: string, value: unknown) => {
                data[key] = value;

                return ok();
            },
        };

        applyMapStateLocalStorage({
            localStorage,
            prefix: 'test-prefix',
            mapStateLocalStorage,
            state: initState,
        });

        expect(data).toEqual({
            'test-prefix:themeMode': 'dark',
            'test-prefix:debugMode': 'true',
        });

        data['test-prefix:evoluMnemonic'] =
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

        const state = applyMapLocalStorageToState({
            localStorage,
            prefix: 'test-prefix',
            mapLocalStorageToState,
        });

        expect(state).toEqual({
            themeMode: 'dark',
            debugMode: true,
        });
    });
});
