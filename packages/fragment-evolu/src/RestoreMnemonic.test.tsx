import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
    RESTORE_MNEMONIC_ERROR,
    RESTORE_MNEMONIC_INPUT,
    RESTORE_MNEMONIC_MODAL_OK,
    RESTORE_MNEMONIC_OPEN_BUTTON,
    RestoreMnemonic,
} from './RestoreMnemonic';

const validMnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow';

const createPendingPromise = () => {
    let resolve: (() => void) | undefined;
    let reject: ((error: unknown) => void) | undefined;
    const promise = new Promise<void>((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return {
        promise,
        resolve: () => resolve?.(),
        reject: (error: unknown) => reject?.(error),
    };
};

const openAndFillRestoreModal = () => {
    fireEvent.click(screen.getByTestId(RESTORE_MNEMONIC_OPEN_BUTTON));
    fireEvent.change(screen.getByTestId(RESTORE_MNEMONIC_INPUT), {
        target: { value: validMnemonic },
    });
};

describe(RestoreMnemonic.name, () => {
    test('prevents duplicate submits and closes only after restoration succeeds', async () => {
        const pending = createPendingPromise();
        const restoreMnemonic = mock.fn(() => pending.promise);
        const Component = () => RestoreMnemonic({ restoreMnemonic });
        render(<Component />);
        openAndFillRestoreModal();

        const okButton = screen.getByTestId(RESTORE_MNEMONIC_MODAL_OK) as HTMLButtonElement;
        fireEvent.click(okButton);
        fireEvent.click(okButton);

        assert.strictEqual(restoreMnemonic.mock.callCount(), 1);
        assert.strictEqual(okButton.disabled, true);
        assert.notStrictEqual(screen.getByTestId(RESTORE_MNEMONIC_INPUT), null);

        await act(async () => {
            pending.resolve();
            await pending.promise;
        });
        assert.strictEqual(screen.queryByTestId(RESTORE_MNEMONIC_INPUT), null);

        fireEvent.click(screen.getByTestId(RESTORE_MNEMONIC_OPEN_BUTTON));
        assert.strictEqual(
            (screen.getByTestId(RESTORE_MNEMONIC_INPUT) as HTMLTextAreaElement).value,
            '',
        );
    });

    test('keeps the modal open and reports restoration failures', async () => {
        const pending = createPendingPromise();
        const restoreMnemonic = mock.fn(() => pending.promise);
        const Component = () => RestoreMnemonic({ restoreMnemonic });
        render(<Component />);
        openAndFillRestoreModal();

        fireEvent.click(screen.getByTestId(RESTORE_MNEMONIC_MODAL_OK));
        await act(async () => {
            pending.reject(new Error('restore failed'));
            await pending.promise.catch(() => undefined);
        });
        assert.notStrictEqual(screen.getByTestId(RESTORE_MNEMONIC_ERROR), null);
        assert.strictEqual(
            (screen.getByTestId(RESTORE_MNEMONIC_INPUT) as HTMLTextAreaElement).value,
            validMnemonic,
        );
    });
});
