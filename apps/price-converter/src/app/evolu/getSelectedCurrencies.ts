import { CurrencyCode, getOrThrow, sqliteTrue } from '@evolu/common';
import type { EvoluDep } from '../../state/addCurrency';

export interface GetSelectedCurrencies {
    readonly query: ReturnType<EvoluDep['evolu']['createQuery']>;
    readonly getWithDefault: (
        currencies: ReadonlyArray<unknown>,
    ) => ReadonlyArray<CurrencyCode>;
}

export interface GetSelectedCurrenciesDep {
    readonly getSelectedCurrencies: GetSelectedCurrencies;
}

type GetSelectedCurrenciesDeps = EvoluDep;

export const createGetSelectedCurrencies = (
    deps: GetSelectedCurrenciesDeps,
): GetSelectedCurrencies => {
    const query = deps.evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency'])
            .where('isDeleted', 'is not', sqliteTrue),
    );

    const getWithDefault = (
        currencies: ReadonlyArray<unknown>,
    ): ReadonlyArray<CurrencyCode> => {
        const selectedCurrencies = (
            currencies as ReadonlyArray<{ currency: CurrencyCode | null }>
        )
            .map(row => row.currency)
            .filter((c): c is CurrencyCode => c !== null);

        // If no currencies selected, return USD as default
        if (selectedCurrencies.length === 0) {
            return [getOrThrow(CurrencyCode.from('USD'))];
        }

        return selectedCurrencies;
    };

    return {
        query,
        getWithDefault,
    };
};
