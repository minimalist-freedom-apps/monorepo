import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text: AntText, Title: AntTitle } = Typography;

interface TextProps {
    readonly children: ReactNode;
    readonly strong?: boolean;
    readonly style?: React.CSSProperties;
}

export const Text = ({ children, strong = false, style }: TextProps) => (
    <AntText strong={strong} style={style}>
        {children}
    </AntText>
);

interface TitleProps {
    readonly children: ReactNode;
    readonly level?: 1 | 2 | 3 | 4 | 5;
    readonly style?: React.CSSProperties;
}

export const Title = ({ children, level = 4, style }: TitleProps) => (
    <AntTitle level={level} style={style}>
        {children}
    </AntTitle>
);
