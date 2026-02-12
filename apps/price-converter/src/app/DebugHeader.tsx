import type { OwnerId } from '@evolu/common';
import { Code } from '@minimalist-apps/components';
import type { FC } from 'react';

export type DebugHeaderStateProps = {
    readonly debugMode: boolean;
    readonly ownerId: OwnerId | null;
};

export type DebugHeaderDep = {
    readonly DebugHeader: FC;
};

export const DebugHeaderPure = ({ debugMode, ownerId }: DebugHeaderStateProps) => {
    if (!debugMode || ownerId === null) {
        return null;
    }

    return <Code inline>{`🐛${ownerId.slice(-6)}`}</Code>;
};
