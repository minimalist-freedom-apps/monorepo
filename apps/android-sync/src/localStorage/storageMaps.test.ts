import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { type Mnemonic, ok } from '@evolu/common';
import {
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { LocalStorage } from '@minimalist-apps/local-storage';
import type { AppState } from '../appStore/AppState';
import { mapLocalStorageToState, mapStateLocalStorage } from './storageMaps';

const initState: AppState = {
    themeMode: 'dark',
    debugMode: true,
    evoluMnemonic:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' as Mnemonic,
    currentScreen: 'Home',
    activeOwnerAppId: null,
    evoluRelayUrls: ['wss://one.example', 'wss://two.example'],
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

        assert.deepStrictEqual(data, {
            'test-prefix:themeMode': 'dark',
            'test-prefix:debugMode': 'true',
            'test-prefix:evoluRelayUrls': 'wss://one.example\nwss://two.example',
        });

        (data as Record<string, unknown>)['test-prefix:evoluMnemonic'] =
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

        const state = applyMapLocalStorageToState({
            localStorage,
            prefix: 'test-prefix',
            mapLocalStorageToState,
        });

        assert.deepStrictEqual(state, {
            themeMode: 'dark',
            debugMode: true,
            evoluRelayUrls: ['wss://one.example', 'wss://two.example'],
        });
    });
});
