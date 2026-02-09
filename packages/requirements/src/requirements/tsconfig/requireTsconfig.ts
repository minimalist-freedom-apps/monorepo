import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { Requirement } from '../Requirement';

const TSCONFIG_PACKAGE = '@minimalist-apps/tsconfig';

const stripJsonComments = (jsonc: string): string =>
    jsonc.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

interface CheckExtendsProps {
    readonly filePath: string;
}

const checkExtends = ({ filePath }: CheckExtendsProps): string | undefined => {
    if (!existsSync(filePath)) {
        return `missing ${basename(filePath)}`;
    }

    const content = readFileSync(filePath, 'utf-8');
    const tsconfig = JSON.parse(stripJsonComments(content));
    const extendsValue: string | undefined = tsconfig.extends;

    if (extendsValue === undefined) {
        return '"extends" is missing';
    }

    if (!extendsValue.startsWith(TSCONFIG_PACKAGE)) {
        return `"extends" must start with "${TSCONFIG_PACKAGE}", found "${extendsValue}"`;
    }

    return undefined;
};

export const requireTsconfig: Requirement = {
    name: 'tsconfig extends shared config',
    applies: ({ dirName }) => dirName !== 'tsconfig',
    fix: async () => [],
    verify: ({ appDir }) => {
        const errors: Array<string> = [];

        const tsconfigError = checkExtends({
            filePath: join(appDir, 'tsconfig.json'),
        });

        if (tsconfigError !== undefined) {
            errors.push(`tsconfig.json: ${tsconfigError}`);
        }

        const nodeConfigPath = join(appDir, 'tsconfig.node.json');

        if (existsSync(nodeConfigPath)) {
            const nodeConfigError = checkExtends({ filePath: nodeConfigPath });

            if (nodeConfigError !== undefined) {
                errors.push(`tsconfig.node.json: ${nodeConfigError}`);
            }
        }

        return errors;
    },
};
