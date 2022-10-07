<script lang="ts">
    import { useParams } from 'svelte-navigator';
    import { derived } from 'svelte/store';

    import { fetch } from '../../stores';
    import { Loading } from '../../components';

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
{:else}
    <h1>Loading...</h1>
{/if}
