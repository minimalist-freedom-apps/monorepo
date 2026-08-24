import { err, ok, type Result } from '@evolu/common';

export const DEFAULT_EVOLU_RELAY_URLS: ReadonlyArray<string> = ['wss://free.evoluhq.com'];

export type EvoluRelayUrlsValidationError = {
    readonly message: string;
};

const invalidRelayUrl = (message: string): Result<never, EvoluRelayUrlsValidationError> =>
    err({ message });

export const parseEvoluRelayUrls = (
    input: string,
): Result<ReadonlyArray<string>, EvoluRelayUrlsValidationError> => {
    const relayUrls = input
        .split(/\r?\n/u)
        .map(url => url.trim())
        .filter(url => url !== '');

    if (relayUrls.length === 0) {
        return invalidRelayUrl('Configure at least one relay.');
    }

    const canonicalUrls = new Set<string>();
    const uniqueRelayUrls: Array<string> = [];

    for (const relayUrl of relayUrls) {
        let parsedUrl: URL;

        try {
            parsedUrl = new URL(relayUrl);
        } catch {
            return invalidRelayUrl(`Invalid relay URL: ${relayUrl}`);
        }

        if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
            return invalidRelayUrl(`Relay URL must use ws:// or wss://: ${relayUrl}`);
        }

        if (parsedUrl.search !== '' || parsedUrl.hash !== '') {
            return invalidRelayUrl(`Relay URL cannot contain a query or fragment: ${relayUrl}`);
        }

        if (parsedUrl.username !== '' || parsedUrl.password !== '') {
            return invalidRelayUrl(`Relay URL cannot contain credentials: ${relayUrl}`);
        }

        if (canonicalUrls.has(parsedUrl.href)) {
            continue;
        }

        canonicalUrls.add(parsedUrl.href);
        uniqueRelayUrls.push(relayUrl);
    }

    return ok(uniqueRelayUrls);
};
