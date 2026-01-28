import { Alert, Text } from '@minimalistic-apps/components';

interface StatusDisplayProps {
    readonly loading: boolean;
    readonly error?: string;
    readonly timeAgo?: string;
}

export const StatusDisplay = ({
    loading,
    error,
    timeAgo,
}: StatusDisplayProps) => (
    <>
        {loading && <div />}
        {error && <Alert message={error} type="error" />}
        {timeAgo && <Text>{timeAgo}</Text>}
    </>
);
