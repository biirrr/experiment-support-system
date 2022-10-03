<script lang="ts">
    import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';
    import { Link } from 'svelte-navigator';

    async function login() {
        const codeVerifier = await generateCodeVerifier();
        window.sessionStorage.setItem('codeVerifier', codeVerifier);
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
</script>

<header class="px-4 py-2 bg-primary-900">
    <nav>
        <ul>
            <li><Link to="/">Experiment Support System</Link></li>
            <li><button on:click={login}>Login</button></li>
        </ul>
    </nav>
</header>
