<script lang="ts">
    import { Link, useLocation } from 'svelte-navigator';

    import { login, currentUser, isBusy } from '../stores';
    import Loading from './Loading.svelte';

    const params = useLocation();
</script>

<header class="relative px-4 bg-neutral-700 text-neutral-50">
    <nav>
        <ul class="flex flex-row space-x-4">
            <li role="presentation" class="flex-none"><Link to="/" class="inline-block py-2 px-4 border-b-4 {$params.pathname === '/' ? 'border-primary' : 'border-neutral-700'} hover:border-primary focus:border-primary transition transition-colors">Experiment Support System</Link></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none"><Link to="/experiments" class="inline-block py-2 px-4 border-b-4 {$params.pathname.startsWith('/experiments')  ? 'border-primary' : 'border-neutral-700'} hover:border-primary focus:border-primary transition transition-colors">Experiments</Link></li>
            {/if}
            <li role="presentation" class="flex-1"></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none"><span class="inline-block py-2 px-4">{$currentUser.name}</span></li>
            {:else}
                <li role="presentation" class="flex-none"><button on:click={login} class="inline-block py-2 px-4 border-b-4 border-neutral-700 hover:border-primary focus:border-primary">Login</button></li>
            {/if}
        </ul>
    </nav>
    {#if $isBusy}
        <Loading/>
    {/if}
</header>
