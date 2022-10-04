<script lang="ts">
    import { OAuth2Client } from '@badgateway/oauth2-client';
    import { useNavigate } from 'svelte-navigator';

    import { login, getUser } from '../stores';
    import { sessionLoadValue, sessionStoreValue, sessionDeleteValue } from '../local-persistence';

    const navigate = useNavigate();

    /**
     * Run the authorisation process.
     */
    async function authorise() {
        const codeVerifier = sessionLoadValue('oauth2.codeVerifier', null) as string | null;
        if (codeVerifier !== null) {
            sessionDeleteValue('oauth2.codeVerifier');
            const client = new OAuth2Client({
                server: 'https://sso.room3b.eu/realms/Development/',
                clientId: 'experiment-support-system',
                discoveryEndpoint: 'https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
            });
            try {
                const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
                    window.document.location.href,
                    {
                        redirectUri: 'http://localhost:5173/oauth2/authorize',
                        codeVerifier: codeVerifier,
                        state: 'abc',
                    }
                );
                sessionStoreValue('oauth2.token', oauth2Token);
                getUser();
                navigate('/');
            } catch(e) {
            }
        }
    }

    authorise();
</script>

<h1>Authentication failed</h1>

<p>Unfortunately the authentication failed. <button on:click={login}>Please log in again.</button></p>
