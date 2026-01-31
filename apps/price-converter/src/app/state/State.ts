import type { CurrencyCode, RatesMap } from '../../rates/FetchRates';

export type Mode = 'BTC' | 'Sats';

export type CurrencyValues = Record<CurrencyCode, string>;

export interface State {
    readonly rates: RatesMap;
    readonly selectedCurrencies: ReadonlyArray<CurrencyCode>;
    readonly btcValue: string;
    readonly currencyValues: Readonly<CurrencyValues>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly mode: Mode;
    readonly showModal: boolean;
    readonly focusedInput: CurrencyCode | 'BTC';
}
