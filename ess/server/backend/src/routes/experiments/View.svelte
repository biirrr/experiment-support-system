<script lang="ts">
    import { onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import { useParams } from 'svelte-navigator';

    import { ButtonLink, Link } from '../../components';
    import { experiment, fetch } from '../../stores';

    const params = useParams();
    const screens = writable([] as ExperimentScreen[]);

    const paramsUnsubscribe = params.subscribe(async (params) => {
        experiment.fetch(Number.parseInt(params.eid));
        const response = await fetch('/experiments/' + params.eid + '/screens');
        screens.set(await response.json());
    });

    onDestroy(paramsUnsubscribe);
</script>

{#if $experiment}
    <h1>{$experiment.title}</h1>
    <section class="w-1/3 border border-neutral-300 rounded shadow">
        <div class="flex flex-row items-center px-3 pt-2 pb-1 border-b border-neutral-300">
            <h2 class="flex-1">Screens</h2>
            <span class="flex-none">
                <ButtonLink to="/experiments/{$params.eid}/screens/create">
                    <svg viewBox="0 0 24 24" class="w-6 h-6">
                        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                </ButtonLink>
            </span>
        </div>
        <ul class="px-3 py-2">
            {#each $screens as screen}
                <li class="py-2"><Link to="/experiments/{$experiment.id}/screens/{screen.id}">{screen.name}</Link></li>
            {:else}
                <li class="py-2">This experiment currently has no screens.</li>
            {/each}
        </ul>
    </section>
{:else}
    <h1>Loading...</h1>
{/if}
