<script lang="ts">
    import { OAuth2Client } from '@badgateway/oauth2-client';

    async function authorize() {
        const codeVerifier = window.sessionStorage.getItem('codeVerifier');
        window.sessionStorage.setItem('codeVerifier', codeVerifier);
        const client = new OAuth2Client({
            server: 'https://sso.room3b.eu/realms/Development/',
            clientId: 'experiment-support-system',
            discoveryEndpoint: 'https://sso.room3b.eu/realms/Development/.well-known/openid-configuration',
        });
        const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
            window.document.location.href,
            {
                redirectUri: 'http://localhost:5173/oauth2/authorize',
                codeVerifier: codeVerifier,
                state: 'abc',
            }
        );
        console.log(oauth2Token);
    }

    authorize();
</script>

Authorize
