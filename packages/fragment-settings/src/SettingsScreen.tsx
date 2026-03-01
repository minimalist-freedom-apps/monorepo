import { Button, Column } from '@minimalist-apps/components';
import type { GoBackDep } from '@minimalist-apps/navigator';
import type { ReactNode } from 'react';

type SettingsScreenProps = GoBackDep & {
    readonly children: ReactNode;
};

export const SettingsScreen = ({ children, goBack }: SettingsScreenProps) => (
    <Column gap={12}>
        <Button
            onClick={goBack}
            variant="text"
            style={{ alignSelf: 'start' }}
            testId="settings-back-button"
        >
            ← Back
        </Button>
        {children}
    </Column>
);
