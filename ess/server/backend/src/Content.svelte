<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Header, Footer } from './components';
    import { OAuth2Authorize } from './routes';
</script>

<Header/>
<div class="px-4 py-4 bg-neutral-800">
    <Route path="/">
        <h1 class="text-2xl font-bold">Experiments</h1>
    </Route>
    <Route path="/experiments/*">Experiment</Route>
    <Route path="/profile">Profile</Route>
    <Route path="/oauth2/authorize"><OAuth2Authorize/></Route>
</div>
<Footer/>
