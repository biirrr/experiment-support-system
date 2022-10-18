<script lang="ts">
    import { onDestroy } from 'svelte';
    import { derived } from 'svelte/store';

    import { ButtonLink, Link } from '../components';
    import { currentUser, experiments } from '../stores';

    const currentUserUnsubscribe = currentUser.subscribe((currentUser) => {
        if (currentUser !== null) {
            experiments.fetch(null);
        }
    });

    const activeExperiments = derived(experiments, (experiments) => {
        if (experiments) {
            return experiments.filter((experiment) => {
                return experiment.status === 'active';
            });
        } else {
            return [];
        }
    });

    const devExperiments = derived(experiments, (experiments) => {
        if (experiments) {
            return experiments.filter((experiment) => {
                return experiment.status === 'development';
            });
        } else {
            return [];
        }
    });

    const completedExperiments = derived(experiments, (experiments) => {
        if (experiments) {
            return experiments.filter((experiment) => {
                return experiment.status === 'completed';
            });
        } else {
            return [];
        }
    });

    onDestroy(currentUserUnsubscribe);
</script>

<h1>Welcome, {$currentUser.name}</h1>

{#if $experiments !== null}
    <div class="flex flex-row space-x-4">
        <section class="flex-1">
            <h2 class="border-b-2 border-primary dark:border-primary-light">Active Experiments</h2>
            <ul>
                {#each $activeExperiments as experiment}
                    <li><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li>You currently have no active experiments.</li>
                {/each}
            </ul>
        </section>
        <section class="flex-1">
            <h2 class="border-b-2 border-primary dark:border-primary-light">Experiments in Development</h2>
            <ul>
                {#each $devExperiments as experiment}
                    <li><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li>You currently have no experiments in development.</li>
                {/each}
            </ul>
            <p class="mt-8"><ButtonLink to="/experiments/create">Create a new Experiment</ButtonLink></p>
        </section>
        <section class="flex-1">
            <h2 class="border-b-2 border-primary dark:border-primary-light">Completed Experiments</h2>
            <ul>
                {#each $completedExperiments as experiment}
                    <li><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li>You currently have no completed experiments.</li>
                {/each}
            </ul>
        </section>
    </div>
{/if}
