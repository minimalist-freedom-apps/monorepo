import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import type { Mode, State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export type ToggleMode = () => void;

export interface ToggleModeDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly getState: () => State;
    readonly saveToLocalStorage: <T>(key: string, value: T) => void;
}

export const createToggleMode =
    (deps: ToggleModeDeps): ToggleMode =>
    () => {
        const { mode, btcValue } = deps.getState();
        const newMode: Mode = mode === 'BTC' ? 'Sats' : 'BTC';
        deps.saveToLocalStorage(STORAGE_KEYS.MODE, newMode);

        let newBtcValue = btcValue;
        if (btcValue) {
            const currentValue = parseFormattedNumber(btcValue);
            if (newMode === 'Sats') {
                const btcAmount =
                    mode === 'BTC' ? currentValue : satsToBtc(currentValue);
                newBtcValue = formatSats(btcToSats(btcAmount));
            } else {
                const btcAmount =
                    mode === 'Sats' ? satsToBtc(currentValue) : currentValue;
                newBtcValue = formatBtcWithCommas(btcAmount);
            }
        }

        deps.setState({ mode: newMode, btcValue: newBtcValue });
    };
