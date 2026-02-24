import { createConnect } from '@minimalist-apps/connect';
import {
    createDebugFragmentCompositionRoot,
    DebugHeaderPure,
    selectDebugMode,
} from '@minimalist-apps/fragment-debug';
import { createEvoluFragmentCompositionRoot } from '@minimalist-apps/fragment-evolu';
import {
    createThemeFragmentCompositionRoot,
    selectThemeMode,
} from '@minimalist-apps/fragment-theme';
import { createLocalStorage } from '@minimalist-apps/local-storage';
import { createOpenMlsGroup } from '@minimalist-apps/mls';
import { createElement } from 'react';
import { AppPure } from './app/App';
import { AppHeader as AppHeaderPure } from './app/AppHeader';
import { ChatScreenPure } from './app/ChatScreen/ChatScreen';
import { DebugRow } from './app/DebugRow';
import { SettingsScreenPure } from './app/SettingsScreen/SettingsScreen';
import { selectCurrentScreen } from './appStore/AppState';
import { createAppStore } from './appStore/createAppStore';
import { allChatMessagesQuery } from './appStore/evolu/allChatMessagesQuery';
import type { ChatMessage } from './appStore/evolu/chatMessage';
import { createChatMessagesStore } from './appStore/evolu/createChatMessagesStore';
import { createSaveChatMessage } from './appStore/evolu/createSaveChatMessage';
import { mapChatMessagesFromEvolu } from './appStore/evolu/mapChatMessagesFromEvolu';
import { Schema } from './appStore/evolu/schema';
import { createNavigate } from './appStore/navigate';
import { createMain, type Main } from './createMain';
import { createLoadInitialState } from './localStorage/loadInitialState';
import { createPersistStore } from './localStorage/persistStore';
import { createStatePersistence } from './localStorage/statePersistence';

export const createCompositionRoot = (): Main => {
    const bytesToBase64 = (value: Uint8Array): string => {
        let binary = '';

        for (const byte of value) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary);
    };

    const base64ToBytes = (value: string): Uint8Array => {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }

        return bytes;
    };

    const localStorage = createLocalStorage();
    const store = createAppStore();
    const buildLocalGroup = () =>
        createOpenMlsGroup({
            groupId: 'chat-v1',
            memberName: 'shared-local-member',
            mode: 'founder',
        });

    const navigate = createNavigate({ store });

    const loadInitialState = createLoadInitialState({
        store,
        localStorage,
    });
    const persistStore = createPersistStore({ store, localStorage });
    const statePersistence = createStatePersistence({ loadInitialState, persistStore });

    const connect = createConnect({ store });
    const connectAppStore = createConnect({ store });

    const { ThemeModeSettings } = createThemeFragmentCompositionRoot({ connect, store });
    const { BackupMnemonic, RestoreMnemonic, ensureEvoluStorage } =
        createEvoluFragmentCompositionRoot({
            connect: connectAppStore,
            store,
            onOwnerUsed: owner => store.setState({ activeOwnerId: owner.id }),
            schema: Schema,
            appName: 'chat-v1',
        });

    const chatMessagesStore = createChatMessagesStore({ ensureEvoluStorage });
    const saveChatMessage = createSaveChatMessage({ ensureEvoluStorage });

    const getEncryptedChatMessages = async () => {
        const storage = await ensureEvoluStorage();
        const query = allChatMessagesQuery(storage);
        const rows = await storage.evolu.loadQuery(query);

        return mapChatMessagesFromEvolu(rows);
    };

    const sendChatMessage = async (props: { readonly senderId: string; readonly text: string }) => {
        const messages = await getEncryptedChatMessages();
        const parentMessageId = messages.length === 0 ? null : messages[messages.length - 1].id;
        const chatGroup = buildLocalGroup();

        for (const message of messages) {
            try {
                chatGroup.readMessage(base64ToBytes(message.encryptedMessage));
            } catch {}
        }

        const encryptedMessage = bytesToBase64(chatGroup.createMessage(props.text));

        const saveResult = await saveChatMessage({
            senderId: props.senderId,
            parentMessageId,
            encryptedMessage,
        });

        if (!saveResult.ok) {
            console.error(saveResult.error);
        }
    };

    const { DebugSettings } = createDebugFragmentCompositionRoot({
        connect: connectAppStore,
        store,
    });

    const DebugHeader = connect(DebugHeaderPure, ({ store }) => ({
        debugMode: selectDebugMode(store),
        children:
            store.activeOwnerId === null
                ? null
                : createElement(DebugRow, { ownerId: store.activeOwnerId }),
    }));

    const AppHeader = connect(AppHeaderPure, () => ({}), {
        onHome: () => navigate('Chat'),
        onOpenSettings: () => navigate('Settings'),
    });

    const connectChat = createConnect({ store, chatMessages: chatMessagesStore });

    const ChatScreen = connectChat(
        ChatScreenPure,
        ({ chatMessages }) => ({
            messages: (() => {
                const chatGroup = buildLocalGroup();
                const parsed: Array<ChatMessage> = [];

                for (const message of chatMessages) {
                    try {
                        parsed.push({
                            ...message,
                            text: chatGroup.readMessage(base64ToBytes(message.encryptedMessage)),
                        });
                    } catch {
                        parsed.push({
                            ...message,
                            text: '[Unable to decrypt message]',
                        });
                    }
                }

                return parsed;
            })(),
        }),
        {
            DebugHeader,
            sendChatMessage,
        },
    );

    const SettingsScreen = () =>
        SettingsScreenPure({
            ThemeModeSettings,
            BackupMnemonic,
            RestoreMnemonic,
            DebugSettings,
            onBack: () => navigate('Chat'),
        });

    const App = connect(
        AppPure,
        ({ store }) => ({
            themeMode: selectThemeMode(store),
            currentScreen: selectCurrentScreen(store),
        }),
        {
            AppHeader,
            ChatScreen,
            SettingsScreen,
        },
    );

    return createMain({ App, statePersistence });
};
