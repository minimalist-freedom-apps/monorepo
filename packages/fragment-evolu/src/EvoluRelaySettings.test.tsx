import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    EVOLU_RELAY_SETTINGS_SAVE_BUTTON,
    EVOLU_RELAY_SETTINGS_TEXTAREA,
    EvoluRelaySettingsPure,
} from './EvoluRelaySettings';

afterEach(cleanup);

describe(EvoluRelaySettingsPure.name, () => {
    test('shows all configured relays', () => {
        const setEvoluRelayUrls = mock.fn(async () => undefined);
        const Component = () =>
            EvoluRelaySettingsPure(
                { setEvoluRelayUrls },
                { evoluRelayUrls: ['wss://one.example', 'wss://two.example'] },
            );

        render(<Component />);

        assert.strictEqual(
            (screen.getByTestId(EVOLU_RELAY_SETTINGS_TEXTAREA) as HTMLTextAreaElement).value,
            'wss://one.example\nwss://two.example',
        );
    });

    test('saves a validated list of relays', async () => {
        const setEvoluRelayUrls = mock.fn(async () => undefined);
        const Component = () =>
            EvoluRelaySettingsPure(
                { setEvoluRelayUrls },
                { evoluRelayUrls: ['wss://one.example'] },
            );

        render(<Component />);

        const textarea = screen.getByTestId(EVOLU_RELAY_SETTINGS_TEXTAREA);
        fireEvent.change(textarea, {
            target: { value: 'wss://two.example\nwss://three.example' },
        });
        fireEvent.click(screen.getByTestId(EVOLU_RELAY_SETTINGS_SAVE_BUTTON));

        await waitFor(() => {
            assert.deepStrictEqual(setEvoluRelayUrls.mock.calls.at(-1)?.arguments, [
                ['wss://two.example', 'wss://three.example'],
            ]);
        });
    });

    test('does not allow an invalid relay URL to be saved', () => {
        const setEvoluRelayUrls = mock.fn(async () => undefined);
        const Component = () =>
            EvoluRelaySettingsPure(
                { setEvoluRelayUrls },
                { evoluRelayUrls: ['wss://one.example'] },
            );

        render(<Component />);

        const textarea = screen.getByTestId(EVOLU_RELAY_SETTINGS_TEXTAREA);
        fireEvent.change(textarea, {
            target: { value: 'https://not-a-websocket.example' },
        });

        assert.strictEqual(
            (screen.getByTestId(EVOLU_RELAY_SETTINGS_SAVE_BUTTON) as HTMLButtonElement).disabled,
            true,
        );
        assert.strictEqual(setEvoluRelayUrls.mock.callCount(), 0);
    });
});
