<script lang="ts">
    import { Link, useLocation } from 'svelte-navigator';

    import { login, currentUser } from '../stores';

    const params = useLocation();
</script>

<header class="px-4 bg-primary text-neutral-50">
    <nav>
        <ul class="flex flex-row space-x-4">
            <li role="presentation" class="flex-none"><Link to="/" class="inline-block py-2 px-4 {$params.pathname === '/' ? 'bg-secondary' : 'bg-primary'} hover:bg-secondary-light focus:bg-secondary-light transition transition-colors">Experiment Support System</Link></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none"><Link to="/experiments" class="inline-block py-2 px-4 {$params.pathname.startsWith('/experiments')  ? 'bg-secondary' : 'bg-primary'} hover:bg-secondary-light focus:bg-secondary-light transition transition-colors">Experiments</Link></li>
            {/if}
            <li role="presentation" class="flex-1"></li>
            {#if $currentUser}
                <li role="presentation" class="flex-none">{$currentUser.name}</li>
            {:else}
                <li role="presentation" class="flex-none"><button on:click={login} class="inline-block py-2 px-4 bg-primary hover:bg-secondary-light focus:bg-secondary-light">Login</button></li>
            {/if}
        </ul>
    </nav>
</header>
