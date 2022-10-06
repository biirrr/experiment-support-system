<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Header, Footer } from './components';
    import { OAuth2Authorize, Dashboard, Experiments } from './routes';
    import { currentUser } from './stores';
</script>

<Header/>
<div class="px-4 py-4 bg-white dark:bg-neutral-700">
    {#if $currentUser}
        <Route path="/"><Dashboard/></Route>
        <Route path="/experiments/*"><Experiments/></Route>
        <Route path="/profile">Profile</Route>
        <Route path="/oauth2/authorize"><OAuth2Authorize/></Route>
    {:else}
        <h1>Welcome to the Experiment Support System</h1>
    {/if}
</div>
<Footer/>
