import { Alert, Text } from '@minimalistic-apps/components';
import { getTimeAgo } from '@minimalistic-apps/utils';
import { useEffect, useRef, useState } from 'react';
import { useServices } from '../ServicesProvider';
import {
    selectError,
    selectLastUpdated,
    selectLoading,
    useStore,
} from './state/createStore';

export const RatesLoading = () => {
    const { fetchAndStoreRates } = useServices();
    const loading = useStore(selectLoading);
    const error = useStore(selectError);
    const lastUpdated = useStore(selectLastUpdated);
    const [timeAgo, setTimeAgo] = useState<string>('');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        fetchAndStoreRates();
    }, [fetchAndStoreRates]);

    useEffect(() => {
        if (lastUpdated) {
            const updateTime = () => {
                setTimeAgo(getTimeAgo(lastUpdated));
            };
            updateTime();
            intervalRef.current = setInterval(updateTime, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [lastUpdated]);

    return (
        <>
            {loading && <div />}
            {error && <Alert message={error} type="error" />}
            {timeAgo && <Text>{timeAgo}</Text>}
        </>
    );
};
