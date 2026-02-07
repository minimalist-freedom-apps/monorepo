import type { StoreDep } from './createStore';
import type { BtcMode } from './State';

export type SetBtcMode = (btcMode: BtcMode) => void;

export interface SetBtcModeDep {
    readonly setBtcMode: SetBtcMode;
}

export const createSetBtcMode =
    (deps: StoreDep): SetBtcMode =>
    btcMode =>
        deps.store.setState({ btcMode });
