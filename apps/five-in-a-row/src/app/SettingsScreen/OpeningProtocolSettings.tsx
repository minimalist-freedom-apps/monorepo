import { Button, Row, SettingsRow } from '@minimalist-apps/components';
import { OPENING_PROTOCOLS, type OpeningProtocol } from '../game/store/createGameStore';
import type { SetOpeningProtocolDeps } from '../game/store/setOpeningProtocol';

export interface OpeningProtocolSettingsStateProps {
    readonly openingProtocol: OpeningProtocol;
}

export type OpeningProtocolSettingsDeps = SetOpeningProtocolDeps;

export const OpeningProtocolSettingsPure = (
    deps: OpeningProtocolSettingsDeps,
    { openingProtocol }: OpeningProtocolSettingsStateProps,
) => (
    <SettingsRow label="Opening Protocol" direction="column">
        <Row gap={8} wrap>
            {OPENING_PROTOCOLS.map(protocol => (
                <Button
                    disabled
                    key={protocol}
                    variant={openingProtocol === protocol ? 'default' : 'text'}
                    onClick={() => deps.setOpeningProtocol(protocol)}
                >
                    {protocol}
                </Button>
            ))}
        </Row>
    </SettingsRow>
);
