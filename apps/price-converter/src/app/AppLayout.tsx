import { Layout } from '@minimalist-apps/components';
import type { FC, ReactNode } from 'react';
import type { AppHeaderDep } from './AppHeader';

export interface AppLayoutProps {
    readonly children: ReactNode;
}

type AppLayoutDeps = AppHeaderDep;

export type AppLayoutDep = {
    readonly AppLayout: FC<AppLayoutProps>;
};

export const AppLayoutPure = (deps: AppLayoutDeps, { children }: AppLayoutProps) => (
    <Layout>
        <Layout.Header>
            <deps.AppHeader />
        </Layout.Header>
        <Layout.Content>{children}</Layout.Content>
    </Layout>
);
