import { Alert as AntAlert } from 'antd';

interface AlertProps {
    readonly message: string;
    readonly type?: 'error' | 'warning' | 'info' | 'success';
    readonly showIcon?: boolean;
    readonly style?: React.CSSProperties;
}

export const Alert = ({
    message,
    type = 'info',
    showIcon = true,
    style,
}: AlertProps) => (
    <AntAlert message={message} type={type} showIcon={showIcon} style={style} />
);
