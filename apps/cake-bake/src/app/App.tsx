import {
    AppHeader,
    Card,
    Column,
    Fraction,
    Input,
    Layout,
    Row,
    Text,
    ThemeProvider,
} from '@minimalistic-apps/components';
import { useState } from 'react';
import { calculateNewAmount } from './calculateNewAmount';

const formatResult = (value: number): string =>
    String(Math.round(value * 100) / 100);

export const App = () => {
    const [amount, setAmount] = useState('');
    const [originalDiameter, setOriginalDiameter] = useState('');
    const [newDiameter, setNewDiameter] = useState('');

    const parsedAmount = Number.parseFloat(amount);
    const parsedOriginal = Number.parseFloat(originalDiameter);
    const parsedNew = Number.parseFloat(newDiameter);

    const canCalculate =
        Number.isFinite(parsedAmount) &&
        Number.isFinite(parsedOriginal) &&
        Number.isFinite(parsedNew);

    const result = canCalculate
        ? calculateNewAmount(parsedAmount, parsedOriginal, parsedNew)
        : null;

    return (
        <ThemeProvider>
            <Layout>
                <Layout.Header>
                    <AppHeader title="🎂 Cake Bake" />
                </Layout.Header>
                <Layout.Content>
                    <Column gap={12}>
                        <Card title="Circle">
                            <Column gap={12}>
                                <Row align="center" justify="center" gap={16}>
                                    <Fraction
                                        numerator={
                                            <Input
                                                value={amount}
                                                onChange={setAmount}
                                                placeholder="amount"
                                                inputMode="decimal"
                                            />
                                        }
                                        denominator={
                                            result !== null ? (
                                                <Text strong large>
                                                    {formatResult(result)}
                                                </Text>
                                            ) : (
                                                <Text large secondary>
                                                    ?
                                                </Text>
                                            )
                                        }
                                    />
                                    <Text strong large>
                                        =
                                    </Text>
                                    <Fraction
                                        numerator={
                                            <Row gap={4} align="center">
                                                <Input
                                                    value={originalDiameter}
                                                    onChange={
                                                        setOriginalDiameter
                                                    }
                                                    placeholder="orig ⌀"
                                                    inputMode="decimal"
                                                />
                                                <Text>²</Text>
                                            </Row>
                                        }
                                        denominator={
                                            <Row gap={4} align="center">
                                                <Input
                                                    value={newDiameter}
                                                    onChange={setNewDiameter}
                                                    placeholder="new ⌀"
                                                    inputMode="decimal"
                                                />
                                                <Text>²</Text>
                                            </Row>
                                        }
                                    />
                                </Row>
                                <Text secondary>
                                    area = π · (d/2)² — the π cancels out
                                </Text>
                            </Column>
                        </Card>
                    </Column>
                </Layout.Content>
            </Layout>
        </ThemeProvider>
    );
};
