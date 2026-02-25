import { Mnemonic } from '@evolu/common';
import type {
    MapLocalStorageToState,
    MapStateLocalStorage,
} from '@minimalist-apps/fragment-local-storage';
import type { State } from '../State';

export const localStoragePrefix = 'price-converter-v2';

export const mapStateLocalStorage: MapStateLocalStorage<State> = {
    rates: state => JSON.stringify(state.rates),
    lastUpdated: state => (state.lastUpdated === null ? null : String(state.lastUpdated)),
    btcMode: state => state.btcMode,
    debugMode: state => String(state.debugMode),
    evoluMnemonic: state => (state.evoluMnemonic === null ? null : state.evoluMnemonic),
};

export const mapLocalStorageToState: MapLocalStorageToState<State> = {
    rates: value => JSON.parse(value) as State['rates'],
    lastUpdated: value => {
        const parsed = Number(value);

        return Number.isNaN(parsed) ? undefined : parsed;
    },
    btcMode: value => (value === 'sats' ? 'sats' : 'btc'),
    debugMode: value => value === 'true',
    evoluMnemonic: value => {
        const mnemonic = Mnemonic.from(value);

        if (mnemonic.ok === false) {
            return null;
        }

        return mnemonic.value;
    },
};
