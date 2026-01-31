import type { CurrencyCode } from '@evolu/common';
import type { AmountBtc } from '@minimalistic-apps/bitcoin';
import type { FiatAmount } from '@minimalistic-apps/fiat';
import { asFiatAmount } from '../../../../packages/fiat/src/types';
import type { RateBtcPerFiat } from './rate';

export const bitcoinToFiat = <T extends CurrencyCode>(
    bitcoinAmount: AmountBtc,
    rate: RateBtcPerFiat<T>,
): FiatAmount<T> => asFiatAmount<T>(bitcoinAmount / rate);
