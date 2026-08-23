import { getOrThrow } from '@evolu/common';
import { AmountBtc, AmountSats } from './types';

const SATOSHI = 100000000; // 1 BTC = 100,000,000 sats

export const btcToSats = (btc: AmountBtc): AmountSats =>
    getOrThrow(AmountSats.fromUnknown(btc * SATOSHI));

export const satsToBtc = (sats: AmountSats): AmountBtc =>
    getOrThrow(AmountBtc.fromUnknown(sats / SATOSHI));
