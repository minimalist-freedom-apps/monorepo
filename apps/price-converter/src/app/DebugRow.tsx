import type { OwnerId } from '@evolu/common';
import { Code } from '@minimalist-apps/components';

interface DebugRowProps {
    readonly ownerId: OwnerId;
}

export const DebugRow = ({ ownerId }: DebugRowProps) => <Code inline>🐛${ownerId.slice(-6)}</Code>;
