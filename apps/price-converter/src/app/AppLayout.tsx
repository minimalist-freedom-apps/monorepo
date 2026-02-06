import { Layout } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/mini-store';
import type { ReactNode } from 'react';
import type { AppHeaderDep } from './AppHeader';

export interface AppLayoutProps {
    readonly children: ReactNode;
}

type AppLayoutDeps = AppHeaderDep;

export type AppLayoutDep = {
    readonly AppLayout: Connected<AppLayoutProps>;
};

export const AppLayoutPure = (
    deps: AppLayoutDeps,
    { children }: AppLayoutProps,
) => (
    <Layout>
        <Layout.Header>
            <deps.AppHeader />
        </Layout.Header>
        <Layout.Content>{children}</Layout.Content>
    </Layout>
);
