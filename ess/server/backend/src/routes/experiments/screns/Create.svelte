<script lang="ts">
    import { useParams } from 'svelte-navigator';
    import { onDestroy } from 'svelte';

    import { Input, Button } from '../../../components';
    import { experiment } from '../../../stores';
    import { niceErrorMessage } from '../../../utils';

    const params = useParams();
    let name = '';
    let errors = {title: null};

    async function createExperiment(ev: FormEventHandler<HTMLFormElement>) {
    }
</script>

{#if $experiment}
    <h1>Add a screen to {$experiment.title}</h1>

    <form on:submit={createExperiment} class="max-w-xl">
        <Input type="text" bind:value={name} error={errors.title}>Name</Input>
        <div class="text-right mt-4 pt-4 border-t border-primary dark:border-primary-light">
            <Button role="submit">Create</Button>
        </div>
    </form>
{/if}
