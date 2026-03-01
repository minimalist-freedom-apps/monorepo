import type { CurrencyCode } from '@evolu/common';
import type { FiatAmount } from '@minimalist-apps/fiat';
import type { SetFiatAmountDep } from '../state/setFiatAmount';
import type { RecalculateFromCurrencyDep } from './recalculateFromCurrency';

interface ChangeFiatAmountParams {
    readonly code: CurrencyCode;
    readonly value: FiatAmount<CurrencyCode>;
}

export type ChangeFiatAmount = (params: ChangeFiatAmountParams) => void;

export interface ChangeFiatAmountDep {
    readonly changeFiatAmount: ChangeFiatAmount;
}

type ChangeFiatAmountDeps = SetFiatAmountDep & RecalculateFromCurrencyDep;

export const createChangeFiatAmount =
    (deps: ChangeFiatAmountDeps): ChangeFiatAmount =>
    ({ code, value }) => {
        deps.setFiatAmount({ code, amount: value });
        deps.recalculateFromCurrency({ code, value });
    };
