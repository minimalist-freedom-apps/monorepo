import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
    EVOLU_RELAY_SETTINGS_SAVE_BUTTON,
    EVOLU_RELAY_SETTINGS_TEXTAREA,
    EvoluRelaySettingsPure,
} from './EvoluRelaySettings';

describe(EvoluRelaySettingsPure.name, () => {
    test('shows all configured relays', () => {
        const setEvoluRelayUrls = vi.fn();
        const Component = () =>
            EvoluRelaySettingsPure(
                { setEvoluRelayUrls },
                { evoluRelayUrls: ['wss://one.example', 'wss://two.example'] },
            );

        render(<Component />);

        expect(
            (screen.getByTestId(EVOLU_RELAY_SETTINGS_TEXTAREA) as HTMLTextAreaElement).value,
        ).toBe('wss://one.example\nwss://two.example');
    });

    test('saves a validated list of relays', async () => {
        const setEvoluRelayUrls = vi.fn().mockResolvedValue(undefined);
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
            expect(setEvoluRelayUrls).toHaveBeenCalledWith([
                'wss://two.example',
                'wss://three.example',
            ]);
        });
    });

    test('does not allow an invalid relay URL to be saved', () => {
        const setEvoluRelayUrls = vi.fn();
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

        expect(
            (screen.getByTestId(EVOLU_RELAY_SETTINGS_SAVE_BUTTON) as HTMLButtonElement).disabled,
        ).toBe(true);
        expect(setEvoluRelayUrls).not.toHaveBeenCalled();
    });
});
