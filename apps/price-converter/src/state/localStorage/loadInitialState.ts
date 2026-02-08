import type { Mnemonic } from '@evolu/common';
import type { LocalStorageDep } from '@minimalist-apps/local-storage';
import type { CurrencyMap } from '../../rates/FetchRates';
import type { StoreDep } from '../../state/createStore';
import type { BtcMode } from '../../state/State';
import { STORAGE_KEYS } from './storageKeys';

export type LoadInitialState = () => void;

export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

type LoadInitialStateDeps = StoreDep & LocalStorageDep;

export const createLoadInitialState =
    (deps: LoadInitialStateDeps): LoadInitialState =>
    () => {
        const savedRatesResult = deps.localStorage.load<CurrencyMap>(STORAGE_KEYS.RATES);
        const savedTimestampResult = deps.localStorage.load<number>(STORAGE_KEYS.TIMESTAMP);
        const savedModeResult = deps.localStorage.load<BtcMode>(STORAGE_KEYS.MODE);
        const savedMnemonicResult = deps.localStorage.load<Mnemonic>(STORAGE_KEYS.EVOLU_MNEMONIC);

        const savedRates = savedRatesResult.ok ? savedRatesResult.value : null;
        const savedTimestamp = savedTimestampResult.ok ? savedTimestampResult.value : null;
        const savedBtcMode: BtcMode = savedModeResult.ok ? (savedModeResult.value ?? 'btc') : 'btc';
        const savedMnemonic = savedMnemonicResult.ok ? savedMnemonicResult.value : null;

        deps.store.setState({
            ...(savedRates !== null && { rates: savedRates }),
            ...(savedTimestamp !== null && { lastUpdated: savedTimestamp }),
            ...{ btcMode: savedBtcMode },
            ...(savedMnemonic && { evoluMnemonic: savedMnemonic }),
        });
    };
