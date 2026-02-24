import { Group, Identity, Provider } from 'openmls-wasm';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type OpenMlsGroupMessage = Uint8Array;
export type OpenMlsGroupKeyPackage = ReturnType<Identity['key_package']>;
export type OpenMlsGroupRatchetTree = ReturnType<Group['export_ratchet_tree']>;

export type OpenMlsJoinData = {
    readonly welcome: OpenMlsGroupMessage;
    readonly ratchetTree: OpenMlsGroupRatchetTree;
};

export type OpenMlsMode = 'founder' | 'pending' | 'joined';

export type CreateOpenMlsGroupParams = {
    readonly groupId: string;
    readonly memberName: string;
    readonly mode: OpenMlsMode;
    readonly joinData?: OpenMlsJoinData;
};

export type OpenMlsGroupClient = {
    readonly createMessage: (text: string) => OpenMlsGroupMessage;
    readonly readMessage: (message: OpenMlsGroupMessage) => string;
    readonly createKeyPackage: () => OpenMlsGroupKeyPackage;
    readonly exportRatchetTree: () => OpenMlsGroupRatchetTree;
    readonly inviteMember: (memberKeyPackage: OpenMlsGroupKeyPackage) => OpenMlsJoinData;
    readonly mergePendingCommit: () => void;
    readonly joinFromWelcome: (joinData: OpenMlsJoinData) => OpenMlsGroupClient;
    readonly kickMember: () => OpenMlsGroupClient;
};

export const createOpenMlsGroup = ({
    groupId,
    memberName,
    mode,
    joinData,
}: CreateOpenMlsGroupParams): OpenMlsGroupClient => {
    const provider = new Provider();
    const identity = new Identity(provider, memberName);

    let group: Group | null =
        mode === 'founder'
            ? Group.create_new(provider, identity, groupId)
            : mode === 'joined'
              ? (() => {
                    if (joinData === undefined) {
                        throw new Error('joinData is required when mode is joined.');
                    }

                    return Group.join(provider, joinData.welcome, joinData.ratchetTree);
                })()
              : null;

    const getGroup = (): Group => {
        if (group === null) {
            throw new Error('Group is not initialized for this client.');
        }

        return group;
    };

    const client: OpenMlsGroupClient = {
        createMessage: text => getGroup().create_message(provider, identity, encoder.encode(text)),
        readMessage: message => decoder.decode(getGroup().process_message(provider, message)),
        createKeyPackage: () => identity.key_package(provider),
        exportRatchetTree: () => getGroup().export_ratchet_tree(),
        inviteMember: memberKeyPackage => {
            const currentGroup = getGroup();
            const addMessages = currentGroup.propose_and_commit_add(
                provider,
                identity,
                memberKeyPackage,
            );

            return {
                welcome: addMessages.welcome,
                ratchetTree: currentGroup.export_ratchet_tree(),
            };
        },
        mergePendingCommit: () => {
            getGroup().merge_pending_commit(provider);
        },
        joinFromWelcome: nextJoinData => {
            group = Group.join(provider, nextJoinData.welcome, nextJoinData.ratchetTree);

            return client;
        },
        kickMember: () => {
            group = Group.create_new(provider, identity, groupId);

            return client;
        },
    };

    return client;
};
