import { describe, expect, test } from 'vitest';
import {
    BitpayResponse,
    BlockchainInfoResponse,
    CoingeckoResponse,
    getPositiveFiniteReciprocal,
    PositiveFiniteNumber,
} from './rateApiValidation';

describe('rate API validation', () => {
    test.each([
        [1, true],
        [0.1, true],
        [0, false],
        [-1, false],
        [Number.NaN, false],
        [Number.POSITIVE_INFINITY, false],
        ['1', false],
    ])('parses finite positive numbers', (value, expected) => {
        expect(PositiveFiniteNumber.fromUnknown(value).ok).toBe(expected);
    });

    test.each([
        [2, 0.5],
        [0, null],
        [-1, null],
        [Number.MIN_VALUE, null],
        [Number.POSITIVE_INFINITY, null],
    ])('returns only finite positive reciprocals', (value, expected) => {
        expect(getPositiveFiniteReciprocal(value)).toBe(expected);
    });

    test('parses Bitpay payloads and allows unknown extra fields', () => {
        const result = BitpayResponse.fromUnknown({
            data: [{ code: 'USD', name: 'US Dollar', rate: 50_000, extra: true }],
            extra: true,
        });

        expect(result.ok).toBe(true);
    });

    test('rejects malformed Bitpay payloads', () => {
        expect(
            BitpayResponse.fromUnknown({
                data: [{ code: 'USD', name: '', rate: 50_000 }],
            }).ok,
        ).toBe(false);
    });

    test('parses Blockchain.info payloads and allows unknown extra fields', () => {
        const result = BlockchainInfoResponse.fromUnknown({
            USD: { last: 50_000, symbol: '$' },
        });

        expect(result.ok).toBe(true);
    });

    test('rejects malformed Blockchain.info payloads', () => {
        expect(BlockchainInfoResponse.fromUnknown({ USD: { last: 0 } }).ok).toBe(false);
    });

    test('parses CoinGecko payloads and allows unknown extra fields', () => {
        const result = CoingeckoResponse.fromUnknown({
            rates: {
                usd: {
                    name: 'US Dollar',
                    type: 'fiat',
                    value: 50_000,
                    unit: '$',
                },
            },
            extra: true,
        });

        expect(result.ok).toBe(true);
    });

    test('rejects malformed CoinGecko payloads', () => {
        expect(
            CoingeckoResponse.fromUnknown({
                rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } },
            }).ok,
        ).toBe(false);
    });
});
