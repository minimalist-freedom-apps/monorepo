import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseEvoluRelayUrls } from './parseEvoluRelayUrls';

describe(parseEvoluRelayUrls.name, () => {
    test('parses, trims, and deduplicates relay URLs while preserving their order', () => {
        const result = parseEvoluRelayUrls(`
            wss://relay-one.example
            ws://localhost:4000/sync
            wss://relay-one.example
        `);

        assert.deepStrictEqual(result, {
            ok: true,
            value: ['wss://relay-one.example', 'ws://localhost:4000/sync'],
        });
    });

    for (const [input, description] of [
        ['', 'an empty list'],
        ['https://relay.example', 'a non-WebSocket URL'],
        ['wss://relay.example?token=secret', 'a URL with a query'],
        ['wss://relay.example#fragment', 'a URL with a fragment'],
        ['wss://user:secret@relay.example', 'a URL with credentials'],
        ['not a URL', 'an invalid URL'],
    ]) {
        test(`rejects ${input} (${description})`, () => {
            assert.strictEqual(parseEvoluRelayUrls(input).ok, false);
        });
    }
});
