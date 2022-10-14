<script lang="ts">
    import { useParams } from 'svelte-navigator';
    import { derived } from 'svelte/store';

    import { ButtonLink } from '../../components';
    import { fetch } from '../../stores';

    const params = useParams();

    const experiment = derived(params, (params, set) => {
        if (params.eid) {
            fetch('/experiments/' + params.eid).then((response) => {
                if (response.status == 200) {
                    response.json().then((obj) => {
                        set(obj);
                    });
                }
            });
        }
    }, null as Experiment);
</script>

{#if $experiment}
    <h1>{$experiment.title}</h1>
    <section class="w-1/3">
        <div class="flex flex-row">
            <h2 class="flex-1">Screens</h2>
            <span class="flex-none">
                <ButtonLink to="/experiments/{$params.eid}/pages/create">
                    <svg viewBox="0 0 24 24" class="w-6 h-6">
                        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                </ButtonLink>
            </span>
        </div>
        <ul>
            <li></li>
        </ul>
    </section>
{:else}
    <h1>Loading...</h1>
{/if}
