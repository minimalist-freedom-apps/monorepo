import { currencyMatchesTerritory } from '@minimalistic-apps/fiat';

interface CurrencyItem {
    readonly code: string;
    readonly name: string;
}

export const filterCurrencies = <T extends CurrencyItem>(
    currencies: ReadonlyArray<T>,
    searchTerm: string,
): ReadonlyArray<T> => {
    if (!searchTerm) {
        return currencies;
    }

    const term = searchTerm.toLowerCase();

    return currencies.filter(({ code, name }) => {
        const matchesCode = code.toLowerCase().includes(term);
        const matchesName = name.toLowerCase().includes(term);
        const matchesTerritory = currencyMatchesTerritory(code, term);

        return matchesCode || matchesName || matchesTerritory;
    });
};
