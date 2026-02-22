import type { CurrencyCode } from '@evolu/common';
import type { AppStoreDep } from './createAppStore';

export type RemoveFiatAmount = (code: CurrencyCode) => void;

export interface RemoveFiatAmountDep {
    readonly removeFiatAmount: RemoveFiatAmount;
}

export const createRemoveFiatAmount =
    (deps: AppStoreDep): RemoveFiatAmount =>
    code => {
        const { fiatAmounts } = deps.appStore.getState();
        const { [code]: _, ...newFiatAmounts } = fiatAmounts;

        deps.appStore.setState({ fiatAmounts: newFiatAmounts });
    };
