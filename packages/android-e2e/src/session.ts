export interface E2ESession extends AsyncDisposable {
    readonly serverUrl: string;
    readonly sessionId: string;
}
