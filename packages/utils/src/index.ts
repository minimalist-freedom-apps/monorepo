export const formatFiatWithCommas = (value: string | number): string => {
    if (!value || Number.isNaN(Number(value))) return '0';

    const num = Number.parseFloat(String(value));
    if (num === 0) return '0';

    const str = num.toFixed(3);
    const [intPart, decPart] = str.split('.');

    // Add thousand separators to integer part
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Remove trailing zeros from decimal
    const formattedDec = decPart ? decPart.replace(/0+$/, '') : '';

    return formattedInt + (formattedDec ? `.${formattedDec}` : '');
};

export const parseFormattedNumber = (str: string): number => {
    if (!str) return 0;

    return Number.parseFloat(str.replace(/,/g, ''));
};
