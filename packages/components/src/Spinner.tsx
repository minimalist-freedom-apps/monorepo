import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface SpinnerProps {
    readonly size?: 'small' | 'default' | 'large';
}

export const Spinner = ({ size = 'default' }: SpinnerProps) => (
    <Spin indicator={<LoadingOutlined spin />} size={size} />
);
