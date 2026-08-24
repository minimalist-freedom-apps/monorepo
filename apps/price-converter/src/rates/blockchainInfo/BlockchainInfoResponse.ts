import { String as EvoluString, object, record, Unknown } from '@evolu/common';
import { PositiveFiniteNumber } from '../positiveFiniteNumber.js';

const UnknownProperties = record(EvoluString, Unknown);

const BlockchainInfoRate = object(
    {
        last: PositiveFiniteNumber,
    },
    UnknownProperties,
);

export const BlockchainInfoResponse = record(EvoluString, BlockchainInfoRate);
export type BlockchainInfoResponse = typeof BlockchainInfoResponse.Output;
