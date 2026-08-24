import { type AbortableFiber, AbortError, type Run } from '@evolu/common';
import type { CurrentDateTimeDep } from '@minimalist-apps/datetime';
import type { CurrencyMap, FetchRatesDep, FetchRatesError } from '../rates/FetchRates';
import type { AppStoreDep } from '../state/createAppStore';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export type FetchAndStoreRates = () => Promise<void>;

export interface FetchAndStoreRatesDep {
    readonly fetchAndStoreRates: FetchAndStoreRates;
}

type FetchAndStoreRatesDeps = AppStoreDep &
    FetchRatesDep &
    RecalculateFromBtcDep &
    CurrentDateTimeDep & {
        readonly run: Run;
    };

export const createFetchAndStoreRates = (deps: FetchAndStoreRatesDeps): FetchAndStoreRates => {
    let activeFiber: AbortableFiber<CurrencyMap, FetchRatesError> | null = null;

    return async () => {
        activeFiber?.abort();
        const fiber = deps.run.abortable(deps.fetchRates);
        activeFiber = fiber;
        deps.appStore.setState({ loading: true, error: '' });

        const result = await fiber;

        if (activeFiber !== fiber) {
            return;
        }
        activeFiber = null;

        if (!result.ok) {
            if (AbortError.is(result.error)) {
                deps.appStore.setState({ loading: false });

                return;
            }

            deps.appStore.setState({
                loading: false,
                error: 'Failed to fetch rates. Please try again.',
            });

            return;
        }

        deps.appStore.setState({
            rates: result.value,
            lastUpdated: deps.currentDateTime(),
            loading: false,
        });
        deps.recalculateFromBtc();
    };
};
