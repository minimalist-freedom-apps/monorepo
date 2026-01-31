import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
    satsToBtc,
} from '@minimalistic-apps/bitcoin';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import type { StoreDep } from '../../compositionRoot';
import type { Mode } from './State';

export type ToggleMode = () => void;

export interface ToggleModeDep {
    readonly toggleMode: ToggleMode;
}

type ToggleModeDeps = StoreDep;

export const createToggleMode =
    (deps: ToggleModeDeps): ToggleMode =>
    () => {
        const { mode, btcValue } = deps.store.getState();
        const newMode: Mode = mode === 'BTC' ? 'Sats' : 'BTC';

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

        deps.store.setState({ mode: newMode, btcValue: newBtcValue });
    };
