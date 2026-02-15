import type { CurrencyCode } from '@evolu/common';
import { Text } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { RateBtcPerFiat } from '../../converter/rate';
import type { BtcMode } from '../../state/State';
import { formatMoscowTime } from './formatMoscowTime';

export type MoscowTimeOwnProps = {
    readonly code: CurrencyCode | 'BTC';
};

export type MoscowTimeStateProps = {
    readonly btcMode: BtcMode;
    readonly rateBtcPerFiat: RateBtcPerFiat<CurrencyCode> | undefined;
};

export type MoscowTimeProps = MoscowTimeOwnProps & MoscowTimeStateProps;

export type MoscowTimeDep = {
    MoscowTime: FC<MoscowTimeOwnProps>;
};

export const MoscowTimePure = ({ code, btcMode, rateBtcPerFiat }: MoscowTimeProps) => (
    <Text intent="secondary" size="small" padding={{ left: 24 }}>
        <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
            {code === 'BTC' || rateBtcPerFiat === undefined ? (
                <> &nbsp;</>
            ) : (
                <>
                    1 {code} = {formatMoscowTime(btcMode, rateBtcPerFiat)}
                </>
            )}
        </span>
    </Text>
);
