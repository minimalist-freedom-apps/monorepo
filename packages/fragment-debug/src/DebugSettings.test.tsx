import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';
import { DebugSettingsPure } from '@minimalist-apps/fragment-debug';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

afterEach(cleanup);

const createTestComponent = (debugMode: boolean) => {
    const setDebugMode = mock.fn();
    const deps = { setDebugMode };
    const DebugSettings = () => <>{DebugSettingsPure(deps, { debugMode })}</>;

    return { setDebugMode, DebugSettings };
};

describe(DebugSettingsPure.name, () => {
    test('renders Debug label', () => {
        const { DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);

        assert.ok(document.body.contains(screen.getByText('Debug')));
    });

    test('switch is checked when debug mode is on', () => {
        const { DebugSettings } = createTestComponent(true);

        render(<DebugSettings />);

        assert.strictEqual(screen.getByRole('switch').getAttribute('aria-checked'), 'true');
    });

    test('switch is unchecked when debug mode is off', () => {
        const { DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);

        assert.strictEqual(screen.getByRole('switch').getAttribute('aria-checked'), 'false');
    });

    test('does not show runtime debug info when debug mode is off', () => {
        const { DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);

        assert.strictEqual(screen.queryByText(/Environment Debug Info/i), null);
    });

    test('shows runtime debug info when debug mode is on', () => {
        const { DebugSettings } = createTestComponent(true);

        render(<DebugSettings />);

        assert.ok(document.body.contains(screen.getByText(/runtime: browser/i)));
        assert.ok(document.body.contains(screen.getByText(/userAgent:/i)));
    });

    test('calls setDebugMode with true when toggling from off', async () => {
        const user = userEvent.setup();
        const { setDebugMode, DebugSettings } = createTestComponent(false);

        render(<DebugSettings />);
        await user.click(screen.getByRole('switch'));

        assert.deepStrictEqual(setDebugMode.mock.calls.at(-1)?.arguments, [true]);
    });

    test('calls setDebugMode with false when toggling from on', async () => {
        const user = userEvent.setup();
        const { setDebugMode, DebugSettings } = createTestComponent(true);

        render(<DebugSettings />);
        await user.click(screen.getByRole('switch'));

        assert.deepStrictEqual(setDebugMode.mock.calls.at(-1)?.arguments, [false]);
    });
});
