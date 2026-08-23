import type { CurrencyCode } from '@minimalist-apps/fiat';
import type { FractionalIndex } from '@minimalist-apps/fractional-indexing';

export interface SelectedCurrency {
    readonly code: CurrencyCode;
    readonly order: FractionalIndex;
}
