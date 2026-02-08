import type { CurrencyCode, Mnemonic } from '@evolu/common';
import type { AmountSats } from '@minimalist-apps/bitcoin';
import type { Theme } from '@minimalist-apps/components';
import type { FiatAmount } from '@minimalist-apps/fiat';
import type { CurrencyMap } from '../rates/FetchRates';

export type BtcMode = 'btc' | 'sats';

export type CurrencyValues = {
    [K in CurrencyCode]?: FiatAmount<K>;
};

export type Screen = 'Converter' | 'AddCurrency' | 'Settings';

export interface State {
    readonly rates: CurrencyMap;
    readonly satsAmount: AmountSats;
    readonly fiatAmounts: Readonly<CurrencyValues>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly btcMode: BtcMode;
    readonly currentScreen: Screen;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
    readonly theme: Theme;
    readonly evoluMnemonic: Mnemonic | null;
}
