import type { CurrencyCode } from '@evolu/common';
import type { AppStoreDep } from './createAppStore';

export type SetFocusedCurrency = (code: CurrencyCode | 'BTC') => void;

export interface SetFocusedCurrencyDep {
    readonly setFocusedCurrency: SetFocusedCurrency;
}

export const createSetFocusedCurrency =
    (deps: AppStoreDep): SetFocusedCurrency =>
    code =>
        deps.appStore.setState({ focusedCurrency: code });
