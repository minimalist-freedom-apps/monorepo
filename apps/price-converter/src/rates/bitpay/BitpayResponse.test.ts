import { describe, expect, test } from 'vitest';
import { BitpayResponse } from './BitpayResponse';

describe('BitpayResponse', () => {
    test('parses payloads and allows unknown extra fields', () => {
        const result = BitpayResponse.fromUnknown({
            data: [{ code: 'USD', name: 'US Dollar', rate: 50_000, extra: true }],
            extra: true,
        });

        expect(result.ok).toBe(true);
    });

    test('rejects malformed payloads', () => {
        expect(
            BitpayResponse.fromUnknown({
                data: [{ code: 'USD', name: '', rate: 50_000 }],
            }).ok,
        ).toBe(false);
    });
});
