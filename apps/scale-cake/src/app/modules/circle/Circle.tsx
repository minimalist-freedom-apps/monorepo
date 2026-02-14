import { Card, Fraction, Input, Row, Text } from '@minimalist-apps/components';
import { useState } from 'react';
import { calculateCircle } from './calculateCircle';

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
        ? calculateCircle({
              amount: parsedAmount,
              originalDiameter: parsedOriginal,
              newDiameter: parsedNew,
          })
        : null;

    return (
        <Card title="Circle">
            <Row align="center" justify="center" gap={16}>
                <Fraction
                    numerator={
                        <Input
                            value={amount}
                            onChange={setAmount}
                            inputMode="decimal"
                            textAlign="center"
                            label="amount"
                        />
                    }
                    denominator={
                        result !== null ? (
                            <Text strong size="large">
                                {result.toFixed(0)}
                            </Text>
                        ) : (
                            <Text size="large" secondary>
                                ?
                            </Text>
                        )
                    }
                />
                <Text strong size="large">
                    =
                </Text>
                <Fraction
                    numerator={
                        <Row gap={4} align="center">
                            <Input
                                value={originalDiameter}
                                onChange={setOriginalDiameter}
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
