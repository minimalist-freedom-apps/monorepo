import type { CurrencyCode } from '@evolu/common';
import type { FiatAmount } from '@minimalistic-apps/fiat';
import type { StoreDep } from './createStore';

export interface SetFiatAmountParams {
    readonly code: CurrencyCode;
    readonly amount: FiatAmount<CurrencyCode>;
}

export type SetFiatAmount = (params: SetFiatAmountParams) => void;

export interface SetFiatAmountDep {
    readonly setFiatAmount: SetFiatAmount;
}

export const createSetFiatAmount =
    (deps: StoreDep): SetFiatAmount =>
    ({ code, amount }) => {
        const { fiatAmounts } = deps.store.getState();

        deps.store.setState({
            fiatAmounts: { ...fiatAmounts, [code]: amount },
        });
    };
