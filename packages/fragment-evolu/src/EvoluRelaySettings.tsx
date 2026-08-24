import { Banner, Button, Column, Row, SettingsRow, Textarea } from '@minimalist-apps/components';
import { parseEvoluRelayUrls } from '@minimalist-apps/evolu';
import type { FC } from 'react';
import { useState } from 'react';
import type { SetEvoluRelayUrlsDep } from './createSetEvoluRelayUrls';

export const EVOLU_RELAY_SETTINGS_TEXTAREA = 'EVOLU_RELAY_SETTINGS_TEXTAREA';
export const EVOLU_RELAY_SETTINGS_SAVE_BUTTON = 'EVOLU_RELAY_SETTINGS_SAVE_BUTTON';

type EvoluRelaySettingsStateProps = {
    readonly evoluRelayUrls: ReadonlyArray<string>;
};

export type EvoluRelaySettingsDep = {
    readonly EvoluRelaySettings: FC;
};

type SaveState = 'idle' | 'saving' | 'failed';

export const EvoluRelaySettingsPure = (
    deps: SetEvoluRelayUrlsDep,
    { evoluRelayUrls }: EvoluRelaySettingsStateProps,
) => {
    const [draft, setDraft] = useState(evoluRelayUrls.join('\n'));
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const parsedRelayUrls = parseEvoluRelayUrls(draft);
    const currentRelayUrls = evoluRelayUrls.join('\n');
    const parsedDraft = parsedRelayUrls.ok ? parsedRelayUrls.value.join('\n') : null;
    const hasChanges = parsedDraft !== null && parsedDraft !== currentRelayUrls;

    const handleDraftChange = (value: string) => {
        setDraft(value);
        setSaveState('idle');
    };

    const handleSave = () => {
        if (!parsedRelayUrls.ok || saveState === 'saving') {
            return;
        }

        setSaveState('saving');
        void deps.setEvoluRelayUrls(parsedRelayUrls.value).then(
            () => {
                setDraft(parsedRelayUrls.value.join('\n'));
                setSaveState('idle');
            },
            () => {
                setSaveState('failed');
            },
        );
    };

    const validationError = parsedRelayUrls.ok ? null : parsedRelayUrls.error.message;

    return (
        <SettingsRow
            label="Sync Relays"
            description="Enter one WebSocket relay URL per line. Two independent relays are recommended."
            direction="column"
        >
            <Column gap={12}>
                <Textarea
                    value={draft}
                    onChange={handleDraftChange}
                    rows={4}
                    disabled={saveState === 'saving'}
                    {...(validationError !== null || saveState === 'failed'
                        ? { status: 'error' as const }
                        : {})}
                    testId={EVOLU_RELAY_SETTINGS_TEXTAREA}
                />
                {validationError !== null ? (
                    <Banner intent="danger">{validationError}</Banner>
                ) : null}
                {saveState === 'failed' ? (
                    <Banner intent="danger">Could not update the sync relays. Try again.</Banner>
                ) : null}
                <Row justify="end">
                    <Button
                        onClick={handleSave}
                        loading={saveState === 'saving'}
                        disabled={!hasChanges || validationError !== null}
                        testId={EVOLU_RELAY_SETTINGS_SAVE_BUTTON}
                    >
                        Save Relays
                    </Button>
                </Row>
            </Column>
        </SettingsRow>
    );
};
