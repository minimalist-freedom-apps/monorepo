export const getEnv = (name: string): string | null => {
    const value = process.env[name];

    if (value == null || value === '') {
        return null;
    }

    return value;
};
