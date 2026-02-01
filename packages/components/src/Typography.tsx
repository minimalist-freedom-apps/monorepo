import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text: AntText, Title: AntTitle } = Typography;

interface TextProps {
    readonly children: ReactNode;
    readonly strong?: boolean;
    readonly onClick?: () => void;
}

export const Text = ({ children, strong = false, onClick }: TextProps) => (
    <AntText strong={strong} onClick={onClick}>
        {children}
    </AntText>
);

interface TitleProps {
    readonly children: ReactNode;
    readonly level?: 1 | 2 | 3 | 4 | 5;
    readonly style?: React.CSSProperties;
    readonly onClick?: () => void;
}

export const Title = ({ children, level = 4, onClick }: TitleProps) => (
    <AntTitle level={level} style={{ margin: 0, padding: 0 }} onClick={onClick}>
        {children}
    </AntTitle>
);
