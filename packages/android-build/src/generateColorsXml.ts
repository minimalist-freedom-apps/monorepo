interface GenerateColorsXmlProps {
    readonly androidColor: string;
}

/**
 * Generates Android colors.xml content from app config.
 * The primary color is taken from config.ts androidColor field.
 */
export const generateColorsXml = ({ androidColor }: GenerateColorsXmlProps): string =>
    `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <color name="colorPrimary">${androidColor}</color>
    <color name="colorPrimaryDark">${androidColor}</color>
    <color name="colorAccent">${androidColor}</color>
</resources>
`;
