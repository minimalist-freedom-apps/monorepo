import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { AppStoreDep } from './createAppStore';

export type SetSatsAmount = (satsAmount: AmountSats) => void;

export interface SetSatsAmountDep {
    readonly setSatsAmount: SetSatsAmount;
}

export const createSetSatsAmount =
    (deps: AppStoreDep): SetSatsAmount =>
    satsAmount =>
        deps.appStore.setState({ satsAmount });
