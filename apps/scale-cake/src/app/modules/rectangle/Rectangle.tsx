import { Card, Fraction, Input, Row, Text } from '@minimalist-apps/components';
import { useState } from 'react';
import { calculateRectangle } from './calculateRectangle';

export const RECTANGLE_AMOUNT_INPUT_TEST_ID = 'RECTANGLE_AMOUNT_INPUT';
export const RECTANGLE_ORIGINAL_A_INPUT_TEST_ID = 'RECTANGLE_ORIGINAL_A_INPUT';
export const RECTANGLE_ORIGINAL_B_INPUT_TEST_ID = 'RECTANGLE_ORIGINAL_B_INPUT';
export const RECTANGLE_NEW_A_INPUT_TEST_ID = 'RECTANGLE_NEW_A_INPUT';
export const RECTANGLE_NEW_B_INPUT_TEST_ID = 'RECTANGLE_NEW_B_INPUT';
export const RECTANGLE_RESULT_TEST_ID = 'RECTANGLE_RESULT';

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
                            testId={RECTANGLE_AMOUNT_INPUT_TEST_ID}
                        />
                    }
                    denominator={
                        result !== null ? (
                            <span data-testid={RECTANGLE_RESULT_TEST_ID}>
                                <Text strong size="large">
                                    {result.toFixed()}
                                </Text>
                            </span>
                        ) : (
                            <span data-testid={RECTANGLE_RESULT_TEST_ID}>
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
                        <Row gap={12} align="center">
                            <Input
                                value={originalA}
                                onChange={setOriginalA}
                                inputMode="decimal"
                                textAlign="center"
                                label="a"
                                testId={RECTANGLE_ORIGINAL_A_INPUT_TEST_ID}
                            />
                            <Text strong>×</Text>
                            <Input
                                value={originalB}
                                onChange={setOriginalB}
                                inputMode="decimal"
                                textAlign="center"
                                label="b"
                                testId={RECTANGLE_ORIGINAL_B_INPUT_TEST_ID}
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
                                testId={RECTANGLE_NEW_A_INPUT_TEST_ID}
                            />
                            <Text strong>×</Text>
                            <Input
                                value={newB}
                                onChange={setNewB}
                                inputMode="decimal"
                                textAlign="center"
                                label="new b"
                                testId={RECTANGLE_NEW_B_INPUT_TEST_ID}
                            />
                        </Row>
                    }
                />
            </Row>
        </Card>
    );
};
