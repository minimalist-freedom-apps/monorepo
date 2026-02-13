import { formatNumberWithCommas } from '@minimalist-apps/number';
import type { AmountSats } from './types';

export const formatSats = (sats: AmountSats): string =>
    formatNumberWithCommas({ value: sats, precision: 3 });
