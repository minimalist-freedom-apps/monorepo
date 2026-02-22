import type { Mnemonic } from '@evolu/common';
import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import type { CurrencyMap } from '../../rates/FetchRates';
import type { BtcMode } from '../../state/State';
import type { AppStoreDep } from '../createAppStore';
import { STORAGE_KEYS } from './storageKeys';

export type LoadInitialState = () => void;

export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

type LoadInitialStateDeps = AppStoreDep & LocalStorageDep;

export const createLoadInitialState =
    (deps: LoadInitialStateDeps): LoadInitialState =>
    () => {
        const savedRatesResult = deps.localStorage.load<CurrencyMap>(STORAGE_KEYS.RATES);
        const savedTimestampResult = deps.localStorage.load<number>(STORAGE_KEYS.TIMESTAMP);
        const savedModeResult = deps.localStorage.load<BtcMode>(STORAGE_KEYS.MODE);
        const savedDebugModeResult = deps.localStorage.load<boolean>(STORAGE_KEYS.DEBUG_MODE);
        const savedMnemonicResult = deps.localStorage.load<Mnemonic>(STORAGE_KEYS.EVOLU_MNEMONIC);

        const savedRates = savedRatesResult.ok ? savedRatesResult.value : null;
        const savedTimestamp = savedTimestampResult.ok ? savedTimestampResult.value : null;
        const savedBtcMode: BtcMode = savedModeResult.ok ? (savedModeResult.value ?? 'btc') : 'btc';
        const savedDebugMode = savedDebugModeResult.ok
            ? (savedDebugModeResult.value ?? false)
            : false;
        const savedMnemonic = savedMnemonicResult.ok ? savedMnemonicResult.value : null;

        deps.appStore.setState({
            ...(savedRates !== null && { rates: savedRates }),
            ...(savedTimestamp !== null && { lastUpdated: savedTimestamp }),
            ...{ btcMode: savedBtcMode },
            ...{ debugMode: savedDebugMode },
            ...(savedMnemonic && { evoluMnemonic: savedMnemonic }),
        });
    };
