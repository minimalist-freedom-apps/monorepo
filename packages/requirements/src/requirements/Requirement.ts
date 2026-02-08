export type ProjectType = 'app' | 'package';

export interface Requirement {
    readonly name: string;

    readonly applies: ({
        projectType,
        dirName,
    }: {
        readonly projectType: ProjectType;
        readonly dirName: string;
    }) => boolean;

    readonly generate: ({ appDir }: { readonly appDir: string }) => Promise<ReadonlyArray<string>>;

    readonly verify: ({ appDir }: { readonly appDir: string }) => ReadonlyArray<string>;
}
