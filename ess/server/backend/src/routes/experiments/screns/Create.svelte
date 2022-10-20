<script lang="ts">
    import { useNavigate } from 'svelte-navigator';

    import { Input, Button } from '../../../components';
    import { experiment, fetch } from '../../../stores';
    import { niceErrorMessage } from '../../../utils';

    const navigate = useNavigate();
    let name = '';
    let errors = {name: null};

    async function createExperiment(ev: FormEventHandler<HTMLFormElement>) {
        ev.preventDefault();
        errors.name = null;
        const response = await fetch('/experiments/' + $experiment.id + '/screens', {
            method: 'POST',
            body: JSON.stringify({name: name}),
        });
        const body = await response.json();
        if (response.status === 200) {
            navigate('/experiments/' + $experiment.id + '/screens/' + body.id);
        } else {
            if (body.detail) {
                for (let error of body.detail) {
                    errors[error.loc[error.loc.length - 1]] = niceErrorMessage(error);
                }
            }
        }
    }
</script>

{#if $experiment}
    <h1>Add a screen to {$experiment.title}</h1>

    <form on:submit={createExperiment} class="max-w-xl">
        <Input type="text" bind:value={name} error={errors.name}>Name</Input>
        <div class="text-right mt-4 pt-4 border-t border-primary dark:border-primary-light">
            <Button role="submit">Create</Button>
        </div>
    </form>
{/if}
