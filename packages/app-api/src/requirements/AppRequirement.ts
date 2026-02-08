export interface AppRequirement {
    readonly name: string;
    readonly generate: ({
        appDir,
    }: {
        readonly appDir: string;
    }) => Promise<ReadonlyArray<string>>;
    readonly verify: ({
        appDir,
    }: {
        readonly appDir: string;
    }) => ReadonlyArray<string>;
}
