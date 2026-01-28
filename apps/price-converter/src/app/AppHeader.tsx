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
        <Title level={4}>{title}</Title>
        <Row gap={8}>
            <Button variant="text" onClick={onModeToggle}>
                {mode}
            </Button>
            <Button
                variant="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
            />
        </Row>
    </Header>
);
