import { CurrencyCode, getOrThrow } from '@evolu/common';
import type { CurrencyInputDep } from '@minimalist-apps/currency-input';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { CurrencyRowPure } from './CurrencyFiatRow.js';
import type { MoscowTimeDep } from './MoscowTime.js';

type TestDeps = CurrencyInputDep & MoscowTimeDep;
const USD = getOrThrow(CurrencyCode.from('USD'));

const createTestDeps = (): TestDeps => ({
    CurrencyInput: ({ code, value, onChange }) => (
        <input
            aria-label={`${code} input`}
            value={String(value)}
            onChange={event => onChange(Number(event.target.value) || 0)}
        />
    ),
    MoscowTime: () => null,
});

describe(CurrencyRowPure.name, () => {
    test('renders remove icon button for fiat rows', () => {
        const deps = createTestDeps();
        const onRemove = vi.fn();
        const TestComponent: FC = () =>
            CurrencyRowPure(deps, {
                btcMode: 'btc',
                code: USD,
                value: 100,
                onChange: vi.fn(),
                onRemove,
            });

        render(<TestComponent />);

        expect(screen.getByRole('button', { name: '🗑️' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Bitcoin note' })).not.toBeInTheDocument();
    });

    test('opens BTC easter-egg modal on click and closes with OK', async () => {
        const user = userEvent.setup();
        const deps = createTestDeps();
        const TestComponent: FC = () =>
            CurrencyRowPure(deps, {
                btcMode: 'btc',
                code: 'BTC',
                value: 0,
                onChange: vi.fn(),
            });

        render(<TestComponent />);
        const [btcNoteButton] = screen.getAllByRole('button');
        expect(screen.queryByText(/Fiat currencies inevitably die/i)).not.toBeInTheDocument();

        await user.click(btcNoteButton);

        expect(screen.getByText(/Fiat currencies inevitably die/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'OK' }));

        await waitFor(() => {
            expect(screen.getByText(/Fiat currencies inevitably die/i)).not.toBeVisible();
        });
    });
});
