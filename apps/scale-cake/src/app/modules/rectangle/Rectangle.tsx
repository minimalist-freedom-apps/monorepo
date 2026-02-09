import { Card, Fraction, Input, Row, Text } from '@minimalist-apps/components';
import { useState } from 'react';
import { calculateRectangle } from './calculateRectangle';

export const Rectangle = () => {
    const [amount, setAmount] = useState('');
    const [originalA, setOriginalA] = useState('');
    const [originalB, setOriginalB] = useState('');
    const [newA, setNewA] = useState('');
    const [newB, setNewB] = useState('');

    const parsedAmount = Number.parseFloat(amount);
    const parsedOriginalA = Number.parseFloat(originalA);
    const parsedOriginalB = Number.parseFloat(originalB);
    const parsedNewA = Number.parseFloat(newA);
    const parsedNewB = Number.parseFloat(newB);

    const canCalculate =
        Number.isFinite(parsedAmount) &&
        Number.isFinite(parsedOriginalA) &&
        Number.isFinite(parsedOriginalB) &&
        Number.isFinite(parsedNewA) &&
        Number.isFinite(parsedNewB);

    const result = canCalculate
        ? calculateRectangle({
              amount: parsedAmount,
              originalA: parsedOriginalA,
              originalB: parsedOriginalB,
              newA: parsedNewA,
              newB: parsedNewB,
          })
        : null;

    return (
        <Card title="Rectangle">
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
                            <Text strong large>
                                {result.toFixed()}
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
                        <Row gap={12} align="center">
                            <Input
                                value={originalA}
                                onChange={setOriginalA}
                                inputMode="decimal"
                                textAlign="center"
                                label="a"
                            />
                            <Text strong>×</Text>
                            <Input
                                value={originalB}
                                onChange={setOriginalB}
                                inputMode="decimal"
                                textAlign="center"
                                label="b"
                            />
                        </Row>
                    }
                    denominator={
                        <Row gap={12} align="center">
                            <Input
                                value={newA}
                                onChange={setNewA}
                                inputMode="decimal"
                                textAlign="center"
                                label="new a"
                            />
                            <Text strong>×</Text>
                            <Input
                                value={newB}
                                onChange={setNewB}
                                inputMode="decimal"
                                textAlign="center"
                                label="new b"
                            />
                        </Row>
                    }
                />
            </Row>
        </Card>
    );
};
