import { DebugSettingsPure } from '@minimalist-apps/fragment-debug';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

const createTestComponent = (debugMode: boolean) => {
    const setDebugMode = vi.fn();
    const deps = { setDebugMode };
    const DebugSettings = () => <>{DebugSettingsPure(deps, { debugMode })}</>;

    return { setDebugMode, DebugSettings };
};

describe(DebugSettingsPure.name, () => {
    test('renders Debug label', () => {
        const { DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);

        expect(screen.getByText('Debug')).toBeInTheDocument();
    });

    test('switch is checked when debug mode is on', () => {
        const { DebugSettings } = createTestComponent(true);

        render(<DebugSettings />);

        expect(screen.getByRole('switch')).toBeChecked();
    });

    test('switch is unchecked when debug mode is off', () => {
        const { DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);

        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('calls setDebugMode with true when toggling from off', async () => {
        const user = userEvent.setup();
        const { setDebugMode, DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);
        await user.click(screen.getByRole('switch'));

        expect(setDebugMode).toHaveBeenCalledWith(true);
    });

    test('calls setDebugMode with false when toggling from on', async () => {
        const user = userEvent.setup();
        const { setDebugMode, DebugSettings } = createTestComponent(true);

        render(<DebugSettings />);
        await user.click(screen.getByRole('switch'));

        expect(setDebugMode).toHaveBeenCalledWith(false);
    });
});
