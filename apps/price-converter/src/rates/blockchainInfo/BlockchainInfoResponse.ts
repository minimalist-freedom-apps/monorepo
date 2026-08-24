import {
    String as EvoluString,
    object,
    PositiveFiniteNumber,
    record,
    Unknown,
} from '@evolu/common';

const UnknownProperties = record(EvoluString, Unknown);

const BlockchainInfoRate = object(
    {
        last: PositiveFiniteNumber,
    },
    UnknownProperties,
);

export const BlockchainInfoResponse = record(EvoluString, BlockchainInfoRate);
export type BlockchainInfoResponse = typeof BlockchainInfoResponse.Output;
