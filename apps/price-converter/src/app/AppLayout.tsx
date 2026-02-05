import { Layout } from '@minimalistic-apps/components';
import type React from 'react';
import type { ReactNode } from 'react';
import type { AppHeaderDep } from './AppHeader';

interface AppLayoutProps {
    readonly children: ReactNode;
}

type AppLayoutDeps = AppHeaderDep;

type AppLayout = React.FC<AppLayoutProps>;

export type AppLayoutDep = {
    readonly AppLayout: AppLayout;
};

export const createAppLayout =
    (deps: AppLayoutDeps): AppLayout =>
    ({ children }: AppLayoutProps) => (
        <Layout>
            <Layout.Header>
                <deps.AppHeader />
            </Layout.Header>
            <Layout.Content>{children}</Layout.Content>
        </Layout>
    );
