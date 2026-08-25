import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { ok } from '@evolu/common';
import type { AmountSats } from '@minimalist-apps/bitcoin';
import { type CurrencyCode, FiatAmount } from '@minimalist-apps/fiat';
import {
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { LocalStorage } from '@minimalist-apps/local-storage';
import { RateBtcPerFiat } from '../../converter/rate';
import type { State } from '../State';
import { mapLocalStorageToState, mapStateLocalStorage } from './storageMaps';

const USD = 'USD' as CurrencyCode;

const initState: State = {
    rates: {
        [USD]: {
            code: USD,
            name: 'US Dollar',
            rate: RateBtcPerFiat(USD).from(0.00001),
        },
    },
    lastUpdated: 123,
    btcMode: 'sats',
    debugMode: true,
    evoluMnemonic:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' as State['evoluMnemonic'],
    satsAmount: 1234 as AmountSats,
    fiatAmounts: {
        [USD]: FiatAmount(USD).from(567890),
    },
    loading: false,
    error: '',
    focusedCurrency: null,
    activeOwnerAppId: null,
    themeMode: 'dark',
    currentScreen: 'Converter',
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
            'test-prefix:rates': '{"USD":{"code":"USD","name":"US Dollar","rate":0.00001}}',
            'test-prefix:lastUpdated': '123',
            'test-prefix:btcMode': 'sats',
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
            rates: initState.rates,
            lastUpdated: 123,
            btcMode: 'sats',
            debugMode: true,
            evoluRelayUrls: ['wss://one.example', 'wss://two.example'],
        });
    });
});
