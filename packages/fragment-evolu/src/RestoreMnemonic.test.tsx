import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
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
        const restoreMnemonic = vi.fn(() => pending.promise);
        const Component = () => RestoreMnemonic({ restoreMnemonic });
        render(<Component />);
        openAndFillRestoreModal();

        const okButton = screen.getByTestId(RESTORE_MNEMONIC_MODAL_OK) as HTMLButtonElement;
        fireEvent.click(okButton);
        fireEvent.click(okButton);

        expect(restoreMnemonic).toHaveBeenCalledOnce();
        expect(okButton.disabled).toBe(true);
        expect(screen.getByTestId(RESTORE_MNEMONIC_INPUT)).not.toBeNull();

        pending.resolve();

        await waitFor(() => {
            expect(screen.queryByTestId(RESTORE_MNEMONIC_INPUT)).toBeNull();
        });

        fireEvent.click(screen.getByTestId(RESTORE_MNEMONIC_OPEN_BUTTON));
        expect((screen.getByTestId(RESTORE_MNEMONIC_INPUT) as HTMLTextAreaElement).value).toBe('');
    });

    test('keeps the modal open and reports restoration failures', async () => {
        const pending = createPendingPromise();
        const restoreMnemonic = vi.fn(() => pending.promise);
        const Component = () => RestoreMnemonic({ restoreMnemonic });
        render(<Component />);
        openAndFillRestoreModal();

        fireEvent.click(screen.getByTestId(RESTORE_MNEMONIC_MODAL_OK));
        pending.reject(new Error('restore failed'));

        await waitFor(() => {
            expect(screen.getByTestId(RESTORE_MNEMONIC_ERROR)).not.toBeNull();
        });
        expect((screen.getByTestId(RESTORE_MNEMONIC_INPUT) as HTMLTextAreaElement).value).toBe(
            validMnemonic,
        );
    });
});
