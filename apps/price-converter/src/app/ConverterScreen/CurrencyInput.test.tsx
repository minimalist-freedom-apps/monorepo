import type { CurrencyCode } from '@evolu/common';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
    type CurrencyInputProps,
    CurrencyInputPure,
    type CurrencyInputPureDeps,
} from './CurrencyInput.js';

const createCurrencyInput = (
    props: Partial<CurrencyInputProps> = {},
    deps?: Partial<CurrencyInputPureDeps>,
) => ({
    TestCurrencyInput: () =>
        CurrencyInputPure(
            {
                ...deps,
                setFocusedCurrency: () => {},
            },
            {
                mode: 'btc',
                focusedCurrency: null,
                value: 0,
                code: 'USD' as CurrencyCode,
                onChange: () => {},
                ...props,
            },
        ),
});

describe(CurrencyInputPure.name, () => {
    test('calls onChange with value change', () => {
        const onChange = vi.fn();
        const { TestCurrencyInput } = createCurrencyInput({ onChange, code: 'BTC' });

        render(<TestCurrencyInput />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: '2' } });
        expect(onChange).toHaveBeenCalledWith(200_000_000);
    });

    test('switch SATS -> BTC & BTC -> SATS reformats focused BTC input', () => {
        const deps: CurrencyInputPureDeps = {
            setFocusedCurrency: () => {},
        };
        const TestCurrencyInput = (props: CurrencyInputProps) => CurrencyInputPure(deps, props);

        const props: CurrencyInputProps = {
            onChange: () => {},
            mode: 'sats',
            focusedCurrency: 'BTC',
            value: 12345678912345678,
            code: 'BTC',
        };

        const { rerender } = render(<TestCurrencyInput {...props} />);

        expect(screen.getByDisplayValue('12,345,678,912,345,678')).toBeInTheDocument();

        rerender(<TestCurrencyInput {...props} mode="btc" />);
        expect(screen.getByDisplayValue('123,456,789.12,345,678')).toBeInTheDocument();

        rerender(<TestCurrencyInput {...props} mode="sats" />);
        expect(screen.getByDisplayValue('12,345,678,912,345,678')).toBeInTheDocument();
    });

    test.each([
        { value: '-', finalValue: '' },
        { value: '0', finalValue: '0' },
        { value: '1,234', finalValue: '1,234' },
    ])('de-focus does not change currency (input: $value)', ({ value, finalValue }) => {
        const initial = createCurrencyInput({
            mode: 'btc',
            focusedCurrency: 'BTC',
            value: 0,
            code: 'BTC',
        });

        const { rerender } = render(<initial.TestCurrencyInput />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value } });
        expect(input).toHaveValue(value);

        const defocused = createCurrencyInput({
            mode: 'btc',
            focusedCurrency: 'USD' as CurrencyCode,
            value: 0,
            code: 'BTC',
        });

        rerender(<defocused.TestCurrencyInput />);
        expect(screen.getByRole('textbox')).toHaveValue(finalValue);
    });

    test.each([
        { value: '0', finalValue: '0' },
        { value: '-', finalValue: '-' },
        { value: '-1', finalValue: '-1' },
        { value: '0,', finalValue: '0' },
        { value: '0,,', finalValue: '0' },
        { value: '2', finalValue: '2' },
        { value: '1234', finalValue: '1,234' },
        { value: '1234.56', finalValue: '1,234.56' },
        { value: '0.234', finalValue: '0.23,4' },
        { value: '0.1234456789', finalValue: '0.12,345,678' },
    ])('typing rules for focused BTC (input: $value)', ({ value, finalValue }) => {
        const { TestCurrencyInput } = createCurrencyInput({
            mode: 'btc',
            focusedCurrency: 'BTC',
            code: 'BTC',
        });

        render(<TestCurrencyInput />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value } });
        expect(input).toHaveValue(finalValue);
    });

    test.each([
        { value: '0', finalValue: '0' },
        { value: '-', finalValue: '-' },
        { value: '-1', finalValue: '-1' },
        { value: '0,', finalValue: '0' },
        { value: '0,,', finalValue: '0' },
        { value: '2', finalValue: '2' },
        { value: '1234', finalValue: '1,234' },
        { value: '1234.56', finalValue: '1,234.56' },
        { value: '1,234,567,9001', finalValue: '12,345,679,001' },
        { value: '1,234,567,900.123', finalValue: '1,234,567,900.123' },
        { value: '0.234', finalValue: '0.234' },
        { value: '1.2345', finalValue: '1.234' },
    ])('typing rules for focused SATS (input: $value)', ({ value, finalValue }) => {
        const { TestCurrencyInput } = createCurrencyInput({
            mode: 'sats',
            focusedCurrency: 'BTC',
            code: 'BTC',
        });

        render(<TestCurrencyInput />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value } });
        expect(input).toHaveValue(finalValue);
    });

    test.each([
        { value: '0', finalValue: '0' },
        { value: '-', finalValue: '-' },
        { value: '-1', finalValue: '-1' },
        { value: '0,,', finalValue: '0' },
        { value: '1234', finalValue: '1,234' },
        { value: '1234.56', finalValue: '1,234.56' },
        { value: '1,234.', finalValue: '1,234.' },
        { value: '1234.5678', finalValue: '1,234.568' },
    ])('typing rules for focused fiat currency (input: $value)', ({ value, finalValue }) => {
        const { TestCurrencyInput } = createCurrencyInput({
            code: 'USD' as CurrencyCode,
            focusedCurrency: 'USD' as CurrencyCode,
        });

        render(<TestCurrencyInput />);
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value } });
        expect(input).toHaveValue(finalValue);
    });
});
