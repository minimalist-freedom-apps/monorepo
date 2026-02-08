import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { StoreDep } from './createStore';

export type SetSatsAmount = (satsAmount: AmountSats) => void;

export interface SetSatsAmountDep {
    readonly setSatsAmount: SetSatsAmount;
}

export const createSetSatsAmount =
    (deps: StoreDep): SetSatsAmount =>
    satsAmount =>
        deps.store.setState({ satsAmount });
