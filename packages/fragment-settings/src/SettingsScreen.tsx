import { Button, Column } from '@minimalist-apps/components';
import type { ReactNode } from 'react';

type SettingsScreenProps = {
    readonly onBack: () => void;
    readonly children: ReactNode;
};

export const SettingsScreen = ({ children, onBack }: SettingsScreenProps) => (
    <Column gap={12}>
        <Button onClick={onBack} variant="text" style={{ alignSelf: 'start' }}>
            ← Back
        </Button>
        {children}
    </Column>
);
