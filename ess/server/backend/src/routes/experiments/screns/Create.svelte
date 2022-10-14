<script lang="ts">
    import { Input, Button } from '../../../components';
    import { fetch } from '../../../stores';
    import { niceErrorMessage } from '../../../utils';

    let name = '';
    let errors = {title: null};

    async function createExperiment(ev: FormEventHandler<HTMLFormElement>) {
    }
</script>

<h1>Add a screen</h1>

<form on:submit={createExperiment} class="max-w-xl">
    <Input type="text" bind:value={name} error={errors.title}>Name</Input>
    <div class="text-right mt-4 pt-4 border-t border-primary dark:border-primary-light">
        <Button role="submit">Create</Button>
    </div>
</form>
