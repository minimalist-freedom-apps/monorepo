import type { Theme } from '@minimalistic-apps/components';
import { mockConnect } from '@minimalistic-apps/mini-store/mocks';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import {
    createThemeSettings,
    type ThemeSettingsDeps,
} from './ThemeSettings.js';

const createTestDeps = (theme: Theme): ThemeSettingsDeps => ({
    connect: mockConnect({ theme }),
    setTheme: vi.fn(),
});

describe(createThemeSettings.name, () => {
    test('renders Theme Mode label', () => {
        const deps = createTestDeps('dark');
        const ThemeSettings = createThemeSettings(deps);

        render(<ThemeSettings />);

        expect(screen.getByText('Theme Mode')).toBeInTheDocument();
    });

    test('switch is checked when theme is light', () => {
        const deps = createTestDeps('light');
        const ThemeSettings = createThemeSettings(deps);

        render(<ThemeSettings />);

        expect(screen.getByRole('switch')).toBeChecked();
    });

    test('switch is unchecked when theme is dark', () => {
        const deps = createTestDeps('dark');
        const ThemeSettings = createThemeSettings(deps);

        render(<ThemeSettings />);

        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('calls setTheme with light when toggling from dark', async () => {
        const user = userEvent.setup();
        const deps = createTestDeps('dark');
        const ThemeSettings = createThemeSettings(deps);

        render(<ThemeSettings />);
        await user.click(screen.getByRole('switch'));

        expect(deps.setTheme).toHaveBeenCalledWith('light');
    });

    test('calls setTheme with dark when toggling from light', async () => {
        const user = userEvent.setup();
        const deps = createTestDeps('light');
        const ThemeSettings = createThemeSettings(deps);

        render(<ThemeSettings />);
        await user.click(screen.getByRole('switch'));

        expect(deps.setTheme).toHaveBeenCalledWith('dark');
    });
});
