import { ReloadOutlined } from '@ant-design/icons';
import { Button, Flex, Layout, Typography } from 'antd';
import { BRAND_COLORS } from './theme';

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
    readonly title: string;
    readonly onRefresh: () => void;
    readonly loading: boolean;
    readonly mode: string;
    readonly onModeToggle: () => void;
}

/**
 * Application header component using Ant Design Layout.Header.
 */
export const AppHeader = ({
    title,
    onRefresh,
    loading,
    mode,
    onModeToggle,
}: AppHeaderProps) => (
    <Header
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: BRAND_COLORS.primary,
        }}
    >
        <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {title}
        </Title>
        <Flex gap={8}>
            <Button
                type="text"
                onClick={onModeToggle}
                style={{
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontWeight: 600,
                    minWidth: 60,
                }}
            >
                {mode}
            </Button>
            <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                style={{
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
            />
        </Flex>
    </Header>
);
