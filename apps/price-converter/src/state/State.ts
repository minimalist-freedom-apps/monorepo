import type { CurrencyCode, Mnemonic } from '@evolu/common';
import type { AmountSats } from '@minimalistic-apps/bitcoin';
import type { Theme } from '@minimalistic-apps/components';
import type { FiatAmount } from '@minimalistic-apps/fiat';
import type { CurrencyMap } from '../rates/FetchRates';

export type Mode = 'BTC' | 'Sats';

export type CurrencyValues = {
    [K in CurrencyCode]?: FiatAmount<K>;
};

export type Screen = 'Converter' | 'AddCurrency' | 'Settings';

export interface State {
    readonly rates: CurrencyMap;
    readonly satsAmount: AmountSats;
    readonly selectedFiatCurrenciesAmounts: Readonly<CurrencyValues>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly mode: Mode;
    readonly currentScreen: Screen;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
    readonly theme: Theme;
    readonly evoluMnemonic: Mnemonic | null;
}
