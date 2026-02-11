import { describe, expect, test } from 'vitest';
import { isValidNumberInput } from './isValidNumberInput';

describe(isValidNumberInput.name, () => {
    test('allows empty string', () => {
        expect(isValidNumberInput('')).toBe(true);
    });

    test('allows digits', () => {
        expect(isValidNumberInput('123')).toBe(true);
    });

    test('allows decimal point', () => {
        expect(isValidNumberInput('1.5')).toBe(true);
    });

    test('allows trailing decimal point (incomplete number)', () => {
        expect(isValidNumberInput('1.')).toBe(true);
    });

    test('allows leading decimal point', () => {
        expect(isValidNumberInput('.5')).toBe(true);
    });

    test('allows comma as thousand separator', () => {
        expect(isValidNumberInput('1,000')).toBe(true);
    });

    test('allows trailing comma (incomplete formatting)', () => {
        expect(isValidNumberInput('1,')).toBe(true);
    });

    test('allows minus sign alone (incomplete negative)', () => {
        expect(isValidNumberInput('-')).toBe(true);
    });

    test('allows negative number', () => {
        expect(isValidNumberInput('-1,000.50')).toBe(true);
    });

    test('rejects letters', () => {
        expect(isValidNumberInput('abc')).toBe(false);
    });

    test('rejects mixed letters and digits', () => {
        expect(isValidNumberInput('12a3')).toBe(false);
    });

    test('rejects special characters', () => {
        expect(isValidNumberInput('1@2')).toBe(false);
    });

    test('rejects spaces', () => {
        expect(isValidNumberInput('1 2')).toBe(false);
    });

    test('rejects multiple decimal points', () => {
        expect(isValidNumberInput('1.2.3')).toBe(false);
    });

    test('rejects multiple minus signs', () => {
        expect(isValidNumberInput('--1')).toBe(false);
    });

    test('rejects minus not at start', () => {
        expect(isValidNumberInput('1-2')).toBe(false);
    });
});
