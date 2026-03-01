import { Alert, Flex, Row, Text } from '@minimalist-apps/components';
import type { DebugHeaderDep } from '@minimalist-apps/fragment-debug';
import type { IntervalId } from '@minimalist-apps/type-utils';
import { type FC, useEffect, useRef, useState } from 'react';
import type { FetchAndStoreRatesDep } from '../converter/fetchAndStoreRates';

const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ago`;
    }

    if (hours > 0) {
        return `${hours}h ago`;
    }

    if (minutes > 0) {
        return `${minutes}m ago`;
    }

    return `${seconds}s ago`;
};

type RatesLoadingStateProps = {
    readonly error: string;
    readonly lastUpdated: number | null;
};

type RatesLoadingDeps = FetchAndStoreRatesDep & DebugHeaderDep;

export type RatesLoadingDep = {
    readonly RatesLoading: FC;
};

export const RatesLoadingPure = (
    { DebugHeader, fetchAndStoreRates }: RatesLoadingDeps,
    { error, lastUpdated }: RatesLoadingStateProps,
) => {
    const [timeAgo, setTimeAgo] = useState<string>('');
    const intervalRef = useRef<IntervalId | null>(null);

    useEffect(() => {
        fetchAndStoreRates();
    }, [fetchAndStoreRates]);

    useEffect(() => {
        if (lastUpdated !== null) {
            const updateTime = () => {
                setTimeAgo(getTimeAgo(lastUpdated));
            };
            updateTime();
            intervalRef.current = setInterval(updateTime, 1000);

            return () => {
                if (intervalRef.current !== null) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [lastUpdated]);

    return (
        <Row justify="space-between" align="end">
            <Flex>
                <DebugHeader />
                &nbsp;
                {error && <Alert message={error} type="error" />}
            </Flex>
            <Flex>{timeAgo && <Text>{timeAgo}</Text>}</Flex>
        </Row>
    );
};
