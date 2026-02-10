interface GenerateStringsXmlProps {
    readonly appName: string;
    readonly appId: string;
}

/**
 * Generates Android strings.xml content from app config.
 * App name and package identifiers are driven by config.ts.
 */
export const generateStringsXml = ({ appName, appId }: GenerateStringsXmlProps): string =>
    `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${appName}</string>
    <string name="title_activity_main">${appName}</string>
    <string name="package_name">${appId}</string>
    <string name="custom_url_scheme">${appId}</string>
</resources>
`;
