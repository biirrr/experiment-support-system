import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';

import { sessionStoreValue } from '../local-persistence';

/**
 * Start the OIDC login process.
 */
export async function login() {
    const codeVerifier = await generateCodeVerifier();
    sessionStoreValue('oauth2.codeVerifier', codeVerifier);
    const client = new OAuth2Client({
        server: 'https://sso.room3b.eu/realms/Development/',
        clientId: 'experiment-support-system',
        discoveryEndpoint: 'https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
    });
    document.location = await client.authorizationCode.getAuthorizeUri({
        redirectUri: 'http://localhost:5173/oauth2/authorize',
        codeVerifier: codeVerifier,
        scope: ['openid'],
        state: 'abc',
    });
}
