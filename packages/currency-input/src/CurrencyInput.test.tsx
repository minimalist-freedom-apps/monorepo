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

    test.each([
        {
            it: "adding a ',' after adding digit to the end shifts cursor right to stay after the same digit",
            initial: { value: '123', start: 3, end: 3 },
            change: { value: '1234', start: 4, end: 4 },
            final: { value: '1,234', start: 5, end: 5 },
        },
        {
            it: "adding a ',' after adding digit in the middle shifts cursor right to stay after the same digit",
            initial: { value: '666', start: 2, end: 2 },
            change: { value: '6676', start: 3, end: 3 },
            final: { value: '6,676', start: 4, end: 4 },
        },
        {
            it: 'selection with comma will reformat with comma, but cursor moves after the replaced digit',
            // user selected ",2"
            initial: { value: '1,234,567', start: 1, end: 3 },
            // "writes the "9" that replaces the ",2"
            change: { value: '1934,567', start: 2, end: 2 },
            // deleted "," is brought back by formatting but cursor stays after "9"
            final: { value: '1,934,567', start: 3, end: 3 },
        },
        {
            it: 'adding a same digit that forces the precision drop and formatting shift',
            // Bitcoin MAX format (full precision)
            initial: { value: '12,345,678.12,345,678', start: 11, end: 11 },
            // user add "1" right in front of `.` =>  "12,345,678.|12,345,678"
            change: { value: '12,345,678.112,345,678', start: 12, end: 12 },
            // Cursors is moved after written 1 => "12,345,678.1|1,234,567" and last precision value is dropped
            final: { value: '12,345,678.11,234,567', start: 12, end: 12 },
        },
    ])('$it', ({ initial, change, final }) => {
        const { TestCurrencyInput } = createCurrencyInput({
            code: 'BTC' as CurrencyCode,
            focusedCurrency: 'BTC' as CurrencyCode,
        });

        render(<TestCurrencyInput />);
        const input = screen.getByRole('textbox') as HTMLInputElement;

        // 1) initialize input with current state (value + selection)
        fireEvent.change(input, {
            target: {
                value: initial.value,
                selectionStart: initial.start,
                selectionEnd: initial.end,
            },
        });

        expect(input).toHaveValue(initial.value);

        // 2) simulate user edit (changed raw value after typing/replacing)
        fireEvent.change(input, {
            target: {
                value: change.value,
                selectionStart: change.start,
                selectionEnd: change.end,
            },
        });

        // 3) assert final formatted value + caret selection
        expect(input).toHaveValue(final.value);
        expect(input.selectionStart).toBe(final.start);
        expect(input.selectionEnd).toBe(final.end);
    });
});
