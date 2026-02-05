import { Alert, Row, Text } from '@minimalistic-apps/components';
import { useEffect, useRef, useState } from 'react';
import { useDeps } from '../ServicesProvider';
import { selectError, selectLastUpdated, useStore } from '../state/createStore';

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

export const RatesLoading = () => {
    const { fetchAndStoreRates } = useDeps();
    const error = useStore(selectError);
    const lastUpdated = useStore(selectLastUpdated);
    const [timeAgo, setTimeAgo] = useState<string>('');
    const intervalRef = useRef<number | null>(null);

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
        <Row justify={error ? 'space-between' : 'end'} align="end">
            {timeAgo && <Text>{timeAgo}</Text>}
            {error && <Alert message={error} type="error" />}
        </Row>
    );
};
