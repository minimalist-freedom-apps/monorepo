import type { Row } from '@evolu/common';
import { asFractionalIndex, compareFractionalIndex } from '@minimalist-apps/fractional-indexing';
import type { SelectedCurrency } from './SelectedCurrency';

export interface SelectedCurrencyRow extends Row {
    readonly id: string;
    readonly currency: SelectedCurrency['code'] | null;
    readonly order: SelectedCurrency['order'] | null;
}

export const mapSelectedCurrencyFromEvolu = (
    rows: ReadonlyArray<SelectedCurrencyRow>,
): ReadonlyArray<SelectedCurrency> =>
    rows
        .flatMap(row =>
            row.currency === null
                ? []
                : [
                      {
                          id: row.id,
                          code: row.currency,
                          order: row.order ?? asFractionalIndex('~'),
                      },
                  ],
        )
        .toSorted((a, b) => compareFractionalIndex(a.order, b.order));
