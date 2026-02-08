import {
    Card,
    Fraction,
    Input,
    Row,
    Text,
} from '@minimalistic-apps/components';
import { useState } from 'react';
import { calculateCircle } from './calculateCircle';

const formatResult = (value: number): string =>
    String(Math.round(value * 100) / 100);

export const Circle = () => {
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
        ? calculateCircle(parsedAmount, parsedOriginal, parsedNew)
        : null;

    return (
        <Card title="Circle">
            <Row align="center" justify="center" gap={16}>
                <Fraction
                    numerator={
                        <Input
                            value={amount}
                            onChange={setAmount}
                            placeholder="amount"
                            inputMode="decimal"
                            textAlign="center"
                            label="amount"
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
                                onChange={setOriginalDiameter}
                                placeholder="⌀"
                                inputMode="decimal"
                                textAlign="center"
                                label="original ⌀"
                            />
                            <Text>²</Text>
                        </Row>
                    }
                    denominator={
                        <Row gap={4} align="center">
                            <Input
                                value={newDiameter}
                                onChange={setNewDiameter}
                                placeholder="⌀"
                                inputMode="decimal"
                                textAlign="center"
                                label="new ⌀"
                            />
                            <Text>²</Text>
                        </Row>
                    }
                />
            </Row>
        </Card>
    );
};
