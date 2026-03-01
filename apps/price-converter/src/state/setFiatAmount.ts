import type { CurrencyCode } from '@evolu/common';
import type { FiatAmount } from '@minimalist-apps/fiat';
import type { AppStoreDep } from './createAppStore';

interface SetFiatAmountParams {
    readonly code: CurrencyCode;
    readonly amount: FiatAmount<CurrencyCode>;
}

export type SetFiatAmount = (params: SetFiatAmountParams) => void;

export interface SetFiatAmountDep {
    readonly setFiatAmount: SetFiatAmount;
}

export const createSetFiatAmount =
    (deps: AppStoreDep): SetFiatAmount =>
    ({ code, amount }) => {
        const { fiatAmounts } = deps.appStore.getState();

        deps.appStore.setState({
            fiatAmounts: { ...fiatAmounts, [code]: amount },
        });
    };
