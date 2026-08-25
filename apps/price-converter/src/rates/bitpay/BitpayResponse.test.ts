import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { BitpayResponse } from './BitpayResponse';

describe('BitpayResponse', () => {
    test('parses payloads and allows unknown extra fields', () => {
        const result = BitpayResponse.fromUnknown({
            data: [{ code: 'USD', name: 'US Dollar', rate: 50_000, extra: true }],
            extra: true,
        });

        assert.strictEqual(result.ok, true);
    });

    test('rejects malformed payloads', () => {
        assert.strictEqual(
            BitpayResponse.fromUnknown({
                data: [{ code: 'USD', name: '', rate: 50_000 }],
            }).ok,
            false,
        );
    });
});
