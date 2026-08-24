import { describe, expect, test } from 'vitest';
import { BlockchainInfoResponse } from './BlockchainInfoResponse';

describe('BlockchainInfoResponse', () => {
    test('parses payloads and allows unknown extra fields', () => {
        const result = BlockchainInfoResponse.fromUnknown({
            USD: { last: 50_000, symbol: '$' },
        });

        expect(result.ok).toBe(true);
    });

    test('rejects malformed payloads', () => {
        expect(BlockchainInfoResponse.fromUnknown({ USD: { last: 0 } }).ok).toBe(false);
    });
});
