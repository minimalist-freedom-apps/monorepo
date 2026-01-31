export const parseFormattedNumber = (str: string): number => {
    if (!str) return 0;

    return Number.parseFloat(str.replace(/,/g, ''));
};
