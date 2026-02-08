import { currencyMatchesTerritory, type FiatCurrency } from '@minimalist-apps/fiat';

export const filterCurrencies = <T extends FiatCurrency>(
    currencies: ReadonlyArray<T>,
    searchTerm: string,
): ReadonlyArray<T> => {
    if (searchTerm.trim() === '') {
        return currencies;
    }

    const term = searchTerm.toLowerCase();

    return currencies.filter(({ code, name }): boolean => {
        const matchesCode = code.toLowerCase().includes(term);
        const matchesName = name.toLowerCase().includes(term);
        const matchesTerritory = currencyMatchesTerritory(code, term);

        return matchesCode || matchesName || matchesTerritory;
    });
};
