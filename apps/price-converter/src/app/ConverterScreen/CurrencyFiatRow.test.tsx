import { CurrencyCode, getOrThrow } from '@evolu/common';
import type { CurrencyInputDep } from '@minimalist-apps/currency-input';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { describe, expect, test, vi } from 'vitest';
import {
    BTC_EASTER_EGG_MODAL_CONTENT_TEST_ID,
    BTC_EASTER_EGG_MODAL_OK_BUTTON_TEST_ID,
    BTC_EASTER_EGG_MODAL_STATE_TEST_ID,
} from './BtcEasterEggModal.js';
import {
    BTC_NOTE_BUTTON_TEST_ID,
    CurrencyRowPure,
    REMOVE_CURRENCY_BUTTON_TEST_ID,
} from './CurrencyFiatRow.js';
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

describe('CurrencyRowPure', () => {
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

        expect(screen.getByTestId(REMOVE_CURRENCY_BUTTON_TEST_ID)).toBeInTheDocument();
        expect(screen.queryByTestId(BTC_NOTE_BUTTON_TEST_ID)).not.toBeInTheDocument();
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
        const btcNoteButton = screen.getByTestId(BTC_NOTE_BUTTON_TEST_ID);
        expect(screen.queryByTestId(BTC_EASTER_EGG_MODAL_CONTENT_TEST_ID)).not.toBeInTheDocument();
        expect(screen.getByTestId(BTC_EASTER_EGG_MODAL_STATE_TEST_ID)).toHaveAttribute(
            'data-open',
            'false',
        );

        await user.click(btcNoteButton);

        expect(screen.getByTestId(BTC_EASTER_EGG_MODAL_CONTENT_TEST_ID)).toBeInTheDocument();
        expect(screen.getByTestId(BTC_EASTER_EGG_MODAL_STATE_TEST_ID)).toHaveAttribute(
            'data-open',
            'true',
        );
        expect(screen.getByTestId(BTC_EASTER_EGG_MODAL_OK_BUTTON_TEST_ID)).toBeInTheDocument();

        await user.click(screen.getByTestId(BTC_EASTER_EGG_MODAL_OK_BUTTON_TEST_ID));

        await waitFor(() => {
            expect(screen.getByTestId(BTC_EASTER_EGG_MODAL_STATE_TEST_ID)).toHaveAttribute(
                'data-open',
                'false',
            );
        });
    });
});
