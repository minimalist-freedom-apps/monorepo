import type { CurrencyCode } from '@evolu/common';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { asRateBtcPerFiat } from '../../converter/rate.js';
import type { CurrencyMap } from '../../rates/FetchRates.js';
import { AddCurrencyScreenPure } from './AddCurrencyScreen.js';

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

const createTestComponent = (
    selectedCurrencies: ReadonlyArray<CurrencyCode> = [],
) => {
    const navigate = vi.fn();
    const addCurrency = vi.fn();
    const deps = { navigate, addCurrency };
    const rates = createTestRates();

    const AddCurrencyScreen = () => (
        <>{AddCurrencyScreenPure(deps, { rates, selectedCurrencies })}</>
    );

    return { navigate, addCurrency, AddCurrencyScreen };
};

describe(AddCurrencyScreenPure.name, () => {
    test('displays flag emojis for each currency', () => {
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        // USD has 🇺🇸, JPY has 🇯🇵
        expect(screen.getByText(/🇺🇸/)).toBeInTheDocument();
        expect(screen.getByText(/🇯🇵/)).toBeInTheDocument();
    });

    test('displays currency name and code', () => {
        const { AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);

        expect(screen.getByText('United States dollar')).toBeInTheDocument();
        expect(screen.getByText('USD')).toBeInTheDocument();
        expect(screen.getByText('Japanese yen')).toBeInTheDocument();
        expect(screen.getByText('JPY')).toBeInTheDocument();
    });

    test('excludes already selected currencies', () => {
        const { AddCurrencyScreen } = createTestComponent([
            'USD' as CurrencyCode,
        ]);

        render(<AddCurrencyScreen />);

        expect(
            screen.queryByText('United States dollar'),
        ).not.toBeInTheDocument();
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    test('navigates back when back button clicked', async () => {
        const user = userEvent.setup();
        const { navigate, AddCurrencyScreen } = createTestComponent();

        render(<AddCurrencyScreen />);
        await user.click(screen.getByText('← Back'));

        expect(navigate).toHaveBeenCalledWith('Converter');
    });

    test('adds currency and navigates on item click', async () => {
        const user = userEvent.setup();
        const { addCurrency, navigate, AddCurrencyScreen } =
            createTestComponent();

        render(<AddCurrencyScreen />);
        await user.click(screen.getByText('Japanese yen'));

        expect(addCurrency).toHaveBeenCalledWith({ code: 'JPY' });
        expect(navigate).toHaveBeenCalledWith('Converter');
    });
});
