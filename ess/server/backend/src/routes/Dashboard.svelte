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
    <div class="flex flex-row space-x-8">
        <section class="flex-1 border border-neutral-300 rounded shadow">
            <h2 class="border-b border-neutral-300 px-3 py-2">Active Experiments</h2>
            <ul class="px-3 py-2">
                {#each $activeExperiments as experiment}
                    <li class="py-2"><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li class="py-2">You currently have no active experiments.</li>
                {/each}
            </ul>
        </section>
        <section class="flex-1 border border-neutral-300 rounded shadow">
            <h2 class="border-b border-neutral-300 px-3 py-2">Experiments in Development</h2>
            <ul class="px-3 py-2">
                {#each $devExperiments as experiment}
                    <li class="py-2"><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li class="py-2">You currently have no experiments in development.</li>
                {/each}
            </ul>
            <p class="mt-4 px-3 py-2 text-right">
                <ButtonLink to="/experiments/create">
                    <svg viewBox="0 0 24 24" class="inline-block w-4 h-4" aria-hidden="true">
                        <path fill="currentColor" d="M18 14H20V17H23V19H20V22H18V19H15V17H18V14M5 19C5 19.55 5.45 20 6 20H13.34C13.61 20.75 14 21.42 14.53 22H6C4.34 22 3 20.66 3 19C3 18.4 3.18 17.84 3.5 17.36L9 7.81V6C8.45 6 8 5.55 8 5V4C8 2.9 8.9 2 10 2H14C15.11 2 16 2.9 16 4V5C16 5.55 15.55 6 15 6V7.81L17.5 12.18C16.86 12.35 16.24 12.63 15.69 13L13 8.35V4H11V8.35L5.18 18.43C5.07 18.59 5 18.79 5 19M13 16L13.58 15.42C13.21 16.2 13 17.08 13 18H7.73L10.39 13.39L13 16M12.5 12C12.78 12 13 12.22 13 12.5C13 12.78 12.78 13 12.5 13C12.22 13 12 12.78 12 12.5C12 12.22 12.22 12 12.5 12Z" />
                    </svg>
                    <span>Create a new Experiment</span>
                </ButtonLink>
            </p>
        </section>
        <section class="flex-1 border border-neutral-300 rounded shadow">
            <h2 class="border-b border-neutral-300 px-3 py-2">Completed Experiments</h2>
            <ul class="px-3 py-2">
                {#each $completedExperiments as experiment}
                    <li class="py-2"><Link to="/experiments/{experiment.id}">{experiment.title}</Link></li>
                {:else}
                    <li class="py-2">You currently have no completed experiments.</li>
                {/each}
            </ul>
        </section>
    </div>
{/if}
