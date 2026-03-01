import type { OwnerId } from '@evolu/common';
import { Code } from '@minimalist-apps/components';

type DebugRowProps = {
    readonly ownerId: OwnerId;
};

export const DebugRow = ({ ownerId }: DebugRowProps) => (
    <span id="debug-owner-id">
        <Code inline>🐛{ownerId.slice(-6)}</Code>
    </span>
);
