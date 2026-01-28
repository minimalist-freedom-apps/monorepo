import { Alert, Typography } from 'antd';
import { BRAND_COLORS } from './theme';

const { Text } = Typography;

interface StatusDisplayProps {
    readonly loading: boolean;
    readonly error?: string;
    readonly timeAgo?: string;
    readonly isWarning?: boolean;
}

/**
 * Status display component for showing loading state, errors, and time ago.
 */
export const StatusDisplay = ({
    loading,
    error,
    timeAgo,
    isWarning,
}: StatusDisplayProps) => (
    <>
        {loading && (
            <div
                style={{
                    height: 3,
                    background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, #0aa3b3 100%)`,
                    animation: 'loading 1s ease-in-out infinite',
                    marginBottom: 16,
                }}
            />
        )}
        {error && (
            <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
            />
        )}
        {timeAgo && (
            <Text
                style={{
                    display: 'block',
                    textAlign: 'right',
                    fontSize: '0.875rem',
                    color: isWarning ? '#ff4d4f' : '#999',
                    marginBottom: 16,
                    fontWeight: 600,
                }}
            >
                {timeAgo}
            </Text>
        )}
    </>
);
