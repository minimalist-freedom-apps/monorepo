import { Card, Fraction, Input, Row, Text } from '@minimalist-apps/components';
import { useState } from 'react';
import { calculateCircle } from './calculateCircle';

export const CIRCLE_AMOUNT_INPUT_TEST_ID = 'CIRCLE_AMOUNT_INPUT';
export const CIRCLE_ORIGINAL_DIAMETER_INPUT_TEST_ID = 'CIRCLE_ORIGINAL_DIAMETER_INPUT';
export const CIRCLE_NEW_DIAMETER_INPUT_TEST_ID = 'CIRCLE_NEW_DIAMETER_INPUT';
export const CIRCLE_RESULT_TEST_ID = 'CIRCLE_RESULT';

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
                            testId={CIRCLE_AMOUNT_INPUT_TEST_ID}
                        />
                    }
                    denominator={
                        result !== null ? (
                            <span data-testid={CIRCLE_RESULT_TEST_ID}>
                                <Text strong size="large">
                                    {result.toFixed(0)}
                                </Text>
                            </span>
                        ) : (
                            <span data-testid={CIRCLE_RESULT_TEST_ID}>
                                <Text size="large" intent="secondary">
                                    ?
                                </Text>
                            </span>
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
                                testId={CIRCLE_ORIGINAL_DIAMETER_INPUT_TEST_ID}
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
                                testId={CIRCLE_NEW_DIAMETER_INPUT_TEST_ID}
                            />
                            <Text>²</Text>
                        </Row>
                    }
                />
            </Row>
        </Card>
    );
};
