<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Header, Footer, Button} from './components';
    import { OAuth2Authorize, Dashboard, Experiments } from './routes';
    import { currentUser, login } from './stores';
</script>

<Header/>
<div class="px-4 py-4 bg-white dark:bg-neutral-700">
    {#if $currentUser}
        <Route path="/"><Dashboard/></Route>
        <Route path="/experiments/*"><Experiments/></Route>
        <Route path="/profile">Profile</Route>
    {:else}
        <Route path="/oauth2/authorize"><OAuth2Authorize/></Route>
        <h1>Welcome to the Experiment Support System</h1>
        <p>To use the Experiment Support System, you must be <Button on:action={login}>logged in.</Button></p>
    {/if}
</div>
<Footer/>
