<script lang="ts">
    import { useNavigate } from 'svelte-navigator';

    import { Input, Button } from '../../components';
    import { fetch } from '../../stores';
    import { niceErrorMessage } from '../../utils';

    const navigate = useNavigate();
    let title = '';
    let errors = {
        title: null,
    }

    async function createExperiment(ev: FormEventHandler<HTMLFormElement>) {
        ev.preventDefault();
        errors.title = null;
        const response = await fetch('/experiments', {
            method: 'POST',
            body: JSON.stringify({title: title}),
        });
        const body = await response.json();
        if (response.status === 200) {
            navigate('/experiments/' + body.id);
        } else {
            if (body.detail) {
                for (let error of body.detail) {
                    errors[error.loc[error.loc.length - 1]] = niceErrorMessage(error);
                }
            }
        }
    }
</script>

<h1>Create a new Experiment</h1>

<form on:submit={createExperiment} class="max-w-xl">
    <Input type="text" bind:value={title} error={errors.title}>Title</Input>
    <div class="text-right mt-4 pt-4 border-t border-primary dark:border-primary-light">
        <Button role="submit">Create</Button>
    </div>
</form>
