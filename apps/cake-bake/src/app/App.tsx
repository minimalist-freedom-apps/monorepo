import {
    AppHeader,
    Column,
    Layout,
    ThemeProvider,
} from '@minimalistic-apps/components';
import { Circle } from './modules/circle/Circle';
import { Rectangle } from './modules/rectangle/Rectangle';

export const App = () => (
    <ThemeProvider>
        <Layout>
            <Layout.Header>
                <AppHeader title="🎂 Cake Bake" />
            </Layout.Header>
            <Layout.Content>
                <Column gap={12}>
                    <Circle />
                    <Rectangle />
                </Column>
            </Layout.Content>
        </Layout>
    </ThemeProvider>
);
