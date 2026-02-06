import type { Theme } from '@minimalistic-apps/components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ThemeSettingsPure } from './ThemeSettings.js';

const createTestComponent = (theme: Theme) => {
    const setTheme = vi.fn();
    const deps = { setTheme };
    const ThemeSettings = () => <>{ThemeSettingsPure(deps, { theme })}</>;

    return { setTheme, ThemeSettings };
};

describe(ThemeSettingsPure.name, () => {
    test('renders Theme Mode label', () => {
        const { ThemeSettings } = createTestComponent('dark');

        render(<ThemeSettings />);

        expect(screen.getByText('Theme Mode')).toBeInTheDocument();
    });

    test('switch is checked when theme is light', () => {
        const { ThemeSettings } = createTestComponent('light');

        render(<ThemeSettings />);

        expect(screen.getByRole('switch')).toBeChecked();
    });

    test('switch is unchecked when theme is dark', () => {
        const { ThemeSettings } = createTestComponent('dark');

        render(<ThemeSettings />);

        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('calls setTheme with light when toggling from dark', async () => {
        const user = userEvent.setup();
        const { setTheme, ThemeSettings } = createTestComponent('dark');

        render(<ThemeSettings />);
        await user.click(screen.getByRole('switch'));

        expect(setTheme).toHaveBeenCalledWith('light');
    });

    test('calls setTheme with dark when toggling from light', async () => {
        const user = userEvent.setup();
        const { setTheme, ThemeSettings } = createTestComponent('light');

        render(<ThemeSettings />);
        await user.click(screen.getByRole('switch'));

        expect(setTheme).toHaveBeenCalledWith('dark');
    });
});
