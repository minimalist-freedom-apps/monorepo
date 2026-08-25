import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { BlockchainInfoResponse } from './BlockchainInfoResponse';

describe('BlockchainInfoResponse', () => {
    test('parses payloads and allows unknown extra fields', () => {
        const result = BlockchainInfoResponse.fromUnknown({
            USD: { last: 50_000, symbol: '$' },
        });

        assert.strictEqual(result.ok, true);
    });

    test('rejects malformed payloads', () => {
        assert.strictEqual(BlockchainInfoResponse.fromUnknown({ USD: { last: 0 } }).ok, false);
    });
});
