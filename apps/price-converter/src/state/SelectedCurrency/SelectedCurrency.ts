import type { CurrencyCode } from '@evolu/common';
import type { FractionalIndex } from '@minimalist-apps/fractional-indexing';

export interface SelectedCurrency {
    readonly code: CurrencyCode;
    readonly order: FractionalIndex;
}
