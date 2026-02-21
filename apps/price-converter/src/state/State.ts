import type { CurrencyCode, Mnemonic, OwnerId } from '@evolu/common';
import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { FiatAmount } from '@minimalist-apps/fiat';
import type { ThemeState } from '@minimalist-apps/fragment-theme';
import type { CurrencyMap } from '../rates/FetchRates';

export type BtcMode = 'btc' | 'sats';

export type CurrencyValues = {
    [K in CurrencyCode]?: FiatAmount<K>;
};

export type Screen = 'Converter' | 'AddCurrency' | 'Settings';

export interface State extends ThemeState {
    readonly rates: CurrencyMap;
    readonly satsAmount: AmountSats;
    readonly fiatAmounts: Readonly<CurrencyValues>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly btcMode: BtcMode;
    readonly currentScreen: Screen;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
    readonly debugMode: boolean;
    readonly evoluMnemonic: Mnemonic | null;
    readonly evoluOwnerId: OwnerId | null;
}

export const selectEvoluMnemonic = (state: State) => state.evoluMnemonic;
