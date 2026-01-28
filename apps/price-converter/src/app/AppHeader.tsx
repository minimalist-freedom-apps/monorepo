import {
    Button,
    Header,
    ReloadOutlined,
    Row,
    Title,
} from '@minimalistic-apps/components';

interface AppHeaderProps {
    readonly title: string;
    readonly onRefresh: () => void;
    readonly loading: boolean;
    readonly mode: string;
    readonly onModeToggle: () => void;
}

export const AppHeader = ({
    title,
    onRefresh,
    loading,
    mode,
    onModeToggle,
}: AppHeaderProps) => (
    <Header>
        <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {title}
        </Title>
        <Row gap={8}>
            <Button
                variant="text"
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
                variant="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                style={{
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
            />
        </Row>
    </Header>
);
