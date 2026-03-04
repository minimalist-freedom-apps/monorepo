import type { OwnerId } from '@evolu/common';
import { Code } from '@minimalist-apps/components';

type DebugRowProps = {
    readonly ownerId: OwnerId | null;
};

export const DebugRow = ({ ownerId }: DebugRowProps) => (
    <span data-testid="debug-owner-id">
        <Code inline>🐛{ownerId !== null ? ownerId.slice(-6) : 'N/A'}</Code>
    </span>
);
