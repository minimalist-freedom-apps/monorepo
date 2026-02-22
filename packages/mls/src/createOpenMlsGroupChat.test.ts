import { Group, Identity, Provider } from 'openmls-wasm';
import { describe, expect, test } from 'vitest';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

describe('openmls-wasm group flow', () => {
    test('alice creates group, adds bob, both exchange messages, then bob cannot decrypt after alice-only rotation', () => {
        const groupId = 'alice-bob-group';

        const aliceProvider = new Provider();
        const aliceIdentity = new Identity(aliceProvider, 'alice');
        const aliceGroup = Group.create_new(aliceProvider, aliceIdentity, groupId);

        const bobProvider = new Provider();
        const bobIdentity = new Identity(bobProvider, 'bob');
        const bobKeyPackage = bobIdentity.key_package(bobProvider);

        const addMessages = aliceGroup.propose_and_commit_add(
            aliceProvider,
            aliceIdentity,
            bobKeyPackage,
        );

        aliceGroup.merge_pending_commit(aliceProvider);

        const ratchetTree = aliceGroup.export_ratchet_tree();
        const bobGroup = Group.join(bobProvider, addMessages.welcome, ratchetTree);

        const alicePlaintext = 'hello bob';
        const aliceCiphertext = aliceGroup.create_message(
            aliceProvider,
            aliceIdentity,
            encoder.encode(alicePlaintext),
        );
        const bobDecrypted = bobGroup.process_message(bobProvider, aliceCiphertext);

        expect(decoder.decode(bobDecrypted)).toBe(alicePlaintext);

        const bobPlaintext = 'hello alice';
        const bobCiphertext = bobGroup.create_message(
            bobProvider,
            bobIdentity,
            encoder.encode(bobPlaintext),
        );
        const aliceDecrypted = aliceGroup.process_message(aliceProvider, bobCiphertext);

        expect(decoder.decode(aliceDecrypted)).toBe(bobPlaintext);

        const aliceOnlyGroup = Group.create_new(aliceProvider, aliceIdentity, groupId);
        const postKickCiphertext = aliceOnlyGroup.create_message(
            aliceProvider,
            aliceIdentity,
            encoder.encode('secret after bob removed'),
        );

        expect(() => {
            bobGroup.process_message(bobProvider, postKickCiphertext);
        }).toThrow();
    });
});
