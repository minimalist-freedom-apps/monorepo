import { describe, expect, test } from 'vitest';
import { CoingeckoResponse } from './CoingeckoResponse';

describe('CoingeckoResponse', () => {
    test('parses payloads and allows unknown extra fields', () => {
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

    test('rejects malformed payloads', () => {
        expect(
            CoingeckoResponse.fromUnknown({
                rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } },
            }).ok,
        ).toBe(false);
    });
});
