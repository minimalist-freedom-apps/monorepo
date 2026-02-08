import type { CurrencyCode } from '@evolu/common';
import type { AmountBtc } from '@minimalistic-apps/bitcoin';
import type { FiatAmount } from '@minimalistic-apps/fiat';
import type { RateBtcPerFiat } from './rate';

export const fiatToBitcoin = <T extends CurrencyCode>(
    fiatAmount: FiatAmount<T>,
    rate: RateBtcPerFiat<T>,
): AmountBtc => (fiatAmount * rate) as AmountBtc;
