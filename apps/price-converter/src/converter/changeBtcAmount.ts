import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { SetSatsAmountDep } from '../state/setSatsAmount';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export type ChangeBtcAmount = (value: AmountSats) => void;

export interface ChangeBtcAmountDep {
    readonly changeBtcAmount: ChangeBtcAmount;
}

type ChangeBtcAmountDeps = SetSatsAmountDep & RecalculateFromBtcDep;

export const createChangeBtcAmount =
    (deps: ChangeBtcAmountDeps): ChangeBtcAmount =>
    value => {
        deps.setSatsAmount(value);
        deps.recalculateFromBtc();
    };
