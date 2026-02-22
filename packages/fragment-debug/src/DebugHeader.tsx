import { Row } from '@minimalist-apps/components';
import type { FC, ReactNode } from 'react';

export type DebugHeaderStateProps = {
    readonly debugMode: boolean;
    readonly children?: ReactNode;
};

export type DebugHeaderDep = {
    readonly DebugHeader: FC;
};

export const DebugHeaderPure = ({ debugMode, children }: DebugHeaderStateProps) => {
    if (!debugMode) {
        return null;
    }

    return <Row>{children}</Row>;
};
