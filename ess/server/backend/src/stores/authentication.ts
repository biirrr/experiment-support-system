import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';
import { writable } from 'svelte/store';

import { sessionLoadValue, sessionStoreValue, sessionDeleteValue } from '../local-persistence';

export const oauth2Token = writable(sessionLoadValue('oauth2.token', null) as OAuth2Token);

const oauth2Client = new OAuth2Client({
    server: 'https://sso.room3b.eu/realms/Development/',
    clientId: 'experiment-support-system',
    discoveryEndpoint: 'https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
});

oauth2Token.subscribe((oldToken) => {
    if (oldToken) {
        // Refresh the token every 5 Minutes
        setTimeout(async () => {
            oauth2Token.set(await oauth2Client.refreshToken(oldToken));
        }, 300000);
    }
});

/**
 * Start the OIDC login process.
 */
export async function login() {
    const codeVerifier = await generateCodeVerifier();
    sessionStoreValue('oauth2.codeVerifier', codeVerifier);
    document.location = await oauth2Client.authorizationCode.getAuthorizeUri({
        redirectUri: 'http://localhost:5173/oauth2/authorize',
        codeVerifier: codeVerifier,
        scope: ['openid'],
        state: 'abc',
    });
}


/**
 * Run the authorisation process.
 */
export async function authorise() {
    const codeVerifier = sessionLoadValue('oauth2.codeVerifier', null) as string | null;
    if (codeVerifier !== null) {
        sessionDeleteValue('oauth2.codeVerifier');
        sessionDeleteValue('oauth2.token');
        try {
            const newToken = await oauth2Client.authorizationCode.getTokenFromCodeRedirect(
                window.document.location.href,
                {
                    redirectUri: 'http://localhost:5173/oauth2/authorize',
                    codeVerifier: codeVerifier,
                    state: 'abc',
                }
            );
            sessionStoreValue('oauth2.token', newToken);
            oauth2Token.set(newToken);
        } catch(e) {
        }
    }
}
