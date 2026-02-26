export const sleep = (milliseconds: number): Promise<void> =>
    new Promise(resolvePromise => {
        setTimeout(resolvePromise, milliseconds);
    });
