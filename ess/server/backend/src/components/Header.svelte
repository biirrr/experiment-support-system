<script lang="ts">
    import { Link, useLocation } from 'svelte-navigator';

    import { login, currentUser, isBusy } from '../stores';
    import Loading from './Loading.svelte';

    const params = useLocation();
</script>

<header class="sticky bg-white top-0 px-4 shadow">
    <nav class="container mx-auto">
        <ul class="flex flex-row space-x-4">
            <li role="presentation" class="flex-none"><Link to="/" class="inline-block py-3 px-4 {$params.pathname === '/' ? 'text-primary font-bold' : 'text-black'} hover:text-primary focus:text-primary transition transition-colors">Experiment Support System</Link></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none"><Link to="/experiments" class="inline-block py-3 px-4 {$params.pathname.startsWith('/experiments') ? 'text-primary font-bold' : 'text-black'} hover:text-primary focus:text-primary transition transition-colors">Experiments</Link></li>
            {/if}
            <li role="presentation" class="flex-1"></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none"><span class="inline-block py-3 px-4">{$currentUser.name}</span></li>
            {:else}
                <li role="presentation" class="flex-none"><button on:click={login} class="inline-block py-3 px-4 hover:text-primary focus:text-primary transition transition-colors">Login</button></li>
            {/if}
        </ul>
    </nav>
    {#if $isBusy}
        <Loading/>
    {/if}
</header>
