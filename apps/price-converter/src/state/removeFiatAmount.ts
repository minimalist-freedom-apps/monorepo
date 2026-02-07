import type { CurrencyCode } from '@evolu/common';
import type { StoreDep } from './createStore';

export type RemoveFiatAmount = (code: CurrencyCode) => void;

export interface RemoveFiatAmountDep {
    readonly removeFiatAmount: RemoveFiatAmount;
}

export const createRemoveFiatAmount =
    (deps: StoreDep): RemoveFiatAmount =>
    code => {
        const { fiatAmounts } = deps.store.getState();
        const { [code]: _, ...newFiatAmounts } = fiatAmounts;

        deps.store.setState({ fiatAmounts: newFiatAmounts });
    };
