export const addThousandSeparators = (value: string): string =>
    value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
