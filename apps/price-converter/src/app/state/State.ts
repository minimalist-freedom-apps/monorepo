export type Screen = 'Converter' | 'AddCurrency' | 'Settings';

export interface State {
    readonly rates: Record<string, unknown>;
    readonly selectedCurrencies: ReadonlyArray<string>;
    readonly btcValue: string;
    readonly currencyValues: Record<string, string>;
    readonly loading: boolean;
    readonly error: string;
    readonly lastUpdated: number | null;
    readonly mode: 'BTC' | 'Sats';
    readonly showModal: boolean;
    readonly focusedInput: string;
    readonly currentScreen: Screen;
}
