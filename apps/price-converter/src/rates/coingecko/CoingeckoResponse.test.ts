import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
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

        assert.strictEqual(result.ok, true);
    });

    test('rejects malformed payloads', () => {
        assert.strictEqual(
            CoingeckoResponse.fromUnknown({
                rates: { usd: { name: 'US Dollar', type: 'fiat', value: 0 } },
            }).ok,
            false,
        );
    });
});
