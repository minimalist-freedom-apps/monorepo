import { type CurrencyCode, ok } from '@evolu/common';
import type { AmountSats } from '@minimalist-apps/bitcoin';
import { FiatAmount } from '@minimalist-apps/fiat';
import {
    applyMapLocalStorageToState,
    applyMapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { LocalStorage } from '@minimalist-apps/local-storage';
import { describe, expect, test } from 'vitest';
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
    activeOwnerId: null,
    themeMode: 'dark',
    currentScreen: 'Converter',
};

describe('storageMaps', () => {
    test('round-trips persisted values back to equivalent state', () => {
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
            'test-prefix:rates': '{"USD":{"code":"USD","name":"US Dollar","rate":0.00001}}',
            'test-prefix:lastUpdated': '123',
            'test-prefix:btcMode': 'sats',
            'test-prefix:debugMode': 'true',
            'test-prefix:evoluMnemonic':
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        });

        const state = applyMapLocalStorageToState({
            localStorage,
            prefix: 'test-prefix',
            mapLocalStorageToState,
        });

        expect(state).toEqual({
            rates: initState.rates,
            lastUpdated: 123,
            btcMode: 'sats',
            debugMode: true,
            evoluMnemonic:
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        });
    });
});
