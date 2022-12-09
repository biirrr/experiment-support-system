<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Header, Footer, Button} from './components';
    import { OAuth2Authorize, Dashboard } from './routes';
    import { Index as ExperimentIndex, Create as ExperimentCreate, View as ExperimentView } from './routes/experiments';
    import { currentUser, login } from './stores';
</script>

<Header/>
<main id="main-content" class="container mx-auto px-4 py-4">
    {#if $currentUser}
        <Route path="/"><Dashboard/></Route>
        <Route path="/experiments/*">
            <Route path="/"><ExperimentIndex/></Route>
            <Route path="/create"><ExperimentCreate/></Route>
            <Route path="/:eid" let:params={experimentParams}>
                <div class="flex flex-row">
                    <ExperimentView eid={experimentParams.eid}/>
                </div>
            </Route>
        </Route>
        <Route path="/profile">Profile</Route>
    {:else}
        <Route path="/oauth2/authorize"><OAuth2Authorize/></Route>
        <h1>Welcome to the Experiment Support System</h1>
        <p>To use the Experiment Support System, you must be <Button on:action={login}>logged in.</Button></p>
    {/if}
</main>
<Footer/>
