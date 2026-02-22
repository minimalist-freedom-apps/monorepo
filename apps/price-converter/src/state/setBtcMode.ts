import type { AppStoreDep } from './createAppStore';
import type { BtcMode } from './State';

export type SetBtcMode = (btcMode: BtcMode) => void;

export interface SetBtcModeDep {
    readonly setBtcMode: SetBtcMode;
}

export const createSetBtcMode =
    (deps: AppStoreDep): SetBtcMode =>
    btcMode =>
        deps.appStore.setState({ btcMode });
