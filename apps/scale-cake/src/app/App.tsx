import { AppHeader, Column, Layout, ThemeProvider } from '@minimalist-apps/components';
import { config } from '../../config';
import { Circle } from './modules/circle/Circle';
import { Rectangle } from './modules/rectangle/Rectangle';

export const App = () => (
    <ThemeProvider>
        <Layout>
            <Layout.Header>
                <AppHeader title={`${config.appIconEmoji} ${config.appShortName}`} />
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
