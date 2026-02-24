import { describe, expect, test } from 'vitest';
import { createOpenMlsGroup } from './createOpenMlsGroup';

describe('ChatGroup service', () => {
    test('alice and bob can chat in one group and bob cannot read after kick', () => {
        const groupId = 'alice-bob-group';
        const aliceDevice = createOpenMlsGroup({
            groupId,
            memberName: 'alice',
            mode: 'founder',
        });
        const bobDevice = createOpenMlsGroup({
            groupId,
            memberName: 'bob',
            mode: 'pending',
        });

        const invite = aliceDevice.inviteMember(bobDevice.createKeyPackage());
        aliceDevice.mergePendingCommit();
        const ratchetTreeAfterCommit = aliceDevice.exportRatchetTree();

        const bobJoined = bobDevice.joinFromWelcome({
            welcome: invite.welcome,
            ratchetTree: ratchetTreeAfterCommit,
        });

        const aliceCiphertext = aliceDevice.createMessage('hello bob');
        const bobReadAlice = bobJoined.readMessage(aliceCiphertext);

        expect(bobReadAlice).toBe('hello bob');

        const bobCiphertext = bobJoined.createMessage('hello alice');
        const aliceReadBob = aliceDevice.readMessage(bobCiphertext);

        expect(aliceReadBob).toBe('hello alice');

        const aliceAfterKick = aliceDevice.kickMember();
        const postKickCiphertext = aliceAfterKick.createMessage('secret after bob removed');

        expect(() => {
            bobJoined.readMessage(postKickCiphertext);
        }).toThrow();
    });
});
