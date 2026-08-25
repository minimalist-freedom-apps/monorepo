import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';
import { err, ok } from '@evolu/common';
import type { NotificationApi } from '@minimalist-apps/components';
import type { CurrencyCode } from '@minimalist-apps/fiat';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { asRateBtcPerFiat } from '../../converter/rate.js';
import type { CurrencyMap } from '../../rates/FetchRates.js';
import { type AddCurrency, AddCurrencyUpdateError } from '../../state/addCurrency.js';
import type { NavigatorScreen } from '../../state/State.js';
import { AddCurrencyScreenPure } from './AddCurrencyScreen.js';

afterEach(cleanup);

const createTestRates = (): CurrencyMap =>
    ({
        USD: {
            code: 'USD' as CurrencyCode,
            name: 'United States dollar',
            rate: asRateBtcPerFiat(0.00001),
        },
        EUR: {
            code: 'EUR' as CurrencyCode,
            name: 'Euro',
            rate: asRateBtcPerFiat(0.00001),
        },
        JPY: {
            code: 'JPY' as CurrencyCode,
            name: 'Japanese yen',
            rate: asRateBtcPerFiat(0.0000001),
        },
        CHF: {
            code: 'CHF' as CurrencyCode,
            name: 'Swiss franc',
            rate: asRateBtcPerFiat(0.00001),
        },
    }) as CurrencyMap;

const createTestComponent = (selectedCurrencies: ReadonlyArray<CurrencyCode> = []) => {
    const navigate = mock.fn<(screen: NavigatorScreen) => void>();
    const addCurrency = mock.fn<AddCurrency>(async () => ok());
    const showError = mock.fn<NotificationApi['error']>();
    const notification: NotificationApi = {
        success: mock.fn(),
        error: showError,
        info: mock.fn(),
        warning: mock.fn(),
        loading: mock.fn(),
    };
    const deps = { navigate, addCurrency, notification };
    const rates = createTestRates();

    const AddCurrencyScreen = () => (
        <>{AddCurrencyScreenPure(deps, { rates, selectedCurrencies })}</>
    );

    return { navigate, addCurrency, showError, AddCurrencyScreen };
};

describe('AddCurrencyScreenPure', () => {
    test('focuses search input on open', () => {
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        assert.strictEqual(
            document.activeElement,
            screen.getByPlaceholderText('Search currencies...'),
        );
    });

    test('tabs from search input directly to first currency row', async () => {
        const user = userEvent.setup();
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        await user.tab();

        assert.strictEqual(document.activeElement, screen.getByRole('button', { name: /Euro/i }));
    });

    test('displays flag emojis for each currency', () => {
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        // USD has 🇺🇸, JPY has 🇯🇵
        assert.ok(document.body.contains(screen.getByText(/🇺🇸/)));
        assert.ok(document.body.contains(screen.getByText(/🇯🇵/)));
    });

    test('displays currency name and code', () => {
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        assert.ok(document.body.contains(screen.getByText('United States dollar')));
        assert.ok(document.body.contains(screen.getByText('USD')));
        assert.ok(document.body.contains(screen.getByText('Japanese yen')));
        assert.ok(document.body.contains(screen.getByText('JPY')));
    });

    test('excludes already selected currencies', () => {
        const { AddCurrencyScreen } = createTestComponent(['USD' as CurrencyCode]);

        render(<AddCurrencyScreen />);

        assert.strictEqual(screen.queryByText('United States dollar'), null);
        assert.ok(document.body.contains(screen.getByText('Euro')));
    });

    test('navigates back when back button clicked', async () => {
        const user = userEvent.setup();
        const { navigate, AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);
        await user.click(screen.getByText('← Back'));

        assert.deepStrictEqual(navigate.mock.calls.at(-1)?.arguments, ['Converter']);
    });

    test('adds currency and navigates on item click', async () => {
        const user = userEvent.setup();
        const { addCurrency, navigate, AddCurrencyScreen } = createTestComponent();

        addCurrency.mock.mockImplementationOnce(async () => ok());

        render(<AddCurrencyScreen />);
        await user.click(screen.getByText('Japanese yen'));

        assert.deepStrictEqual(addCurrency.mock.calls.at(-1)?.arguments, [{ code: 'JPY' }]);
        assert.deepStrictEqual(navigate.mock.calls.at(-1)?.arguments, ['Converter']);
    });

    test('shows error notification when adding currency fails', async () => {
        const user = userEvent.setup();
        const { addCurrency, navigate, showError, AddCurrencyScreen } = createTestComponent();

        addCurrency.mock.mockImplementationOnce(async () =>
            err(AddCurrencyUpdateError({ caused: new Error('test error') })),
        );

        render(<AddCurrencyScreen />);
        await user.click(screen.getByText('Japanese yen'));

        assert.deepStrictEqual(showError.mock.calls.at(-1)?.arguments, ['Failed to add currency.']);
        assert.notDeepStrictEqual(navigate.mock.calls.at(-1)?.arguments, ['Converter']);
    });
});
