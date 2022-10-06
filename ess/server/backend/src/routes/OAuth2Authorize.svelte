<script lang="ts">
    import { OAuth2Client } from '@badgateway/oauth2-client';
    import { useNavigate } from 'svelte-navigator';

    import { login, authorise } from '../stores';

    const navigate = useNavigate();

    authorise().then(() => {
        navigate('/');
    });
</script>

<h1>Authentication failed</h1>

<p>Unfortunately the authentication failed. This generally indicates a temporary technical issue. <button on:click={login}>Please log in again.</button></p>
